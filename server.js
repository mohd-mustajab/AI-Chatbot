import express from 'express';
import dialogflow from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';  // ✅ fixed import
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Decode Google Cloud credentials from base64
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  const keyPath = '/tmp/service-account-key.json';
  const keyFileContent = Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    'base64'
  ).toString('utf8');
  fs.writeFileSync(keyPath, keyFileContent);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
} else {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS_BASE64 is not set.');
}

// ✅ Dialogflow route
app.post('/api/dialogflow', async (req, res) => {
  const { query, sessionId: clientSessionId } = req.body;
  const projectId = 'mohdmustajab-elpj'; // your Dialogflow project ID

  const sessionId = clientSessionId || uuidv4();
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({
      queryText: result.queryText,
      fulfillmentText: result.fulfillmentText,
      intent: result.intent ? result.intent.displayName : 'No intent matched',
      sessionId,
    });
  } catch (error) {
    console.error('❌ Dialogflow error:', error);
    res.status(500).send('Error communicating with Dialogflow');
  }
});

// ✅ Serve Frontend (for Vercel)
const frontendPath = path.join(__dirname, "dist");
console.log("🧩 Vercel runtime path:", __dirname);
console.log("🧩 dist exists:", fs.existsSync(frontendPath));
console.log("🧩 index.html exists:", fs.existsSync(path.join(frontendPath, "index.html")));
app.use(express.static(frontendPath));

app.get('*', (_, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
