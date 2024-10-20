const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const app = express();

// Decode the base64 string and write it to a temporary file
const serviceAccountKeyBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
const serviceAccountKeyJson = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf-8');


app.use(cors());
app.use(express.json());

let sessionId = null; 

app.post('/api/dialogflow', async (req, res) => {
  const { query, sessionId: clientSessionId } = req.body;

  const projectId = 'mohdmustajab-elpj'; 

  
  sessionId = clientSessionId || uuid.v4();

  
  fs.writeFileSync('/tmp/service-account-key.json', serviceAccountKeyJson);

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: '/tmp/service-account-key.json',
});

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // Dialogflow request
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
    const responseData = {
      queryText: result.queryText,
      fulfillmentText: result.fulfillmentText,
      intent: result.intent ? result.intent.displayName : 'No intent matched',
      sessionId, 
    };
    res.json(responseData); // Send response back to frontend
  } catch (error) {
    console.error('Error during Dialogflow request:', error);
    res.status(500).send('Something went wrong');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
