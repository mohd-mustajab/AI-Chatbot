const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Decode Base64 key and save temporarily (for Dialogflow auth)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  const keyPath = '/tmp/service-account-key.json';
  const keyFileContent = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8');
  fs.writeFileSync(keyPath, keyFileContent);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

// Dialogflow API
app.post('/api/dialogflow', async (req, res) => {
  const { query, sessionId: clientSessionId } = req.body;
  const projectId = 'mohdmustajab-elpj';

  const sessionId = clientSessionId || uuid.v4();
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text: query, languageCode: 'en-US' },
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
    console.error('Dialogflow error:', error);
    res.status(500).send('Error communicating with Dialogflow');
  }
});

// Serve Frontend (React build output)
const frontendPath = path.join(__dirname, 'Frontend', 'dist');
app.use(express.static(frontendPath));
app.get('*', (_, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
