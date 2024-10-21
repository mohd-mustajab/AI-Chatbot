const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Step 1: Decode Base64 service account key and save as a file
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  const keyPath = '/tmp/service-account-key.json';  // Temporary file location on the server
  
  // Decode the Base64 string into the original JSON content
  const keyFileContent = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8');
  
  // Write the decoded content to the temporary JSON file
  fs.writeFileSync(keyPath, keyFileContent);
  
  // Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the temporary file path
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
} else {
  console.error('GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable is not set.');
  process.exit(1);  // Exit if the key is not available
}

// Dialogflow Session ID - to maintain context across multiple queries
let sessionId = null;

// Dialogflow endpoint
app.post('/api/dialogflow', async (req, res) => {
  const { query, sessionId: clientSessionId } = req.body;

  const projectId = 'mohdmustajab-elpj';  // Your Dialogflow project ID

  // Reuse session ID if provided from the frontend, otherwise generate a new one
  sessionId = clientSessionId || uuid.v4();

  // Create a new session with the Dialogflow SessionsClient
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // Dialogflow request object
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,  // User query sent from the frontend
        languageCode: 'en-US',
      },
    },
  };

  try {
    // Call Dialogflow's detectIntent method to get the response
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Prepare the response to send back to the frontend
    const responseData = {
      queryText: result.queryText,
      fulfillmentText: result.fulfillmentText,
      intent: result.intent ? result.intent.displayName : 'No intent matched',
      sessionId,  // Send the session ID back to the frontend for follow-up queries
    };

    // Send the response
    res.json(responseData);
  } catch (error) {
    console.error('Error during Dialogflow request:', error);
    res.status(500).send('Something went wrong');
  }
});

// Server listening on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
