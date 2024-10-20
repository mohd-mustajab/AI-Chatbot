const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

let sessionId = null; 

app.post('/api/dialogflow', async (req, res) => {
  const { query, sessionId: clientSessionId } = req.body;

  const projectId = 'mohdmustajab-elpj'; 

  
  sessionId = clientSessionId || uuid.v4();

  
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
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
