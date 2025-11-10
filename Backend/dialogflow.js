import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    const keyPath = "/tmp/service-account-key.json";
    const keyFileContent = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, "base64").toString("utf8");
    fs.writeFileSync(keyPath, keyFileContent);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
  } else {
    return res.status(500).json({ error: "Missing Google credentials" });
  }

  const { query, sessionId: clientSessionId } = req.body;
  const projectId = "mohdmustajab-elpj";

  const sessionId = clientSessionId || uuidv4();
  const sessionClient = new SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text: query, languageCode: "en-US" }
    }
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    res.json({
      queryText: response.queryResult.queryText,
      fulfillmentText: response.queryResult.fulfillmentText,
      intent: response.queryResult.intent?.displayName || "No intent matched",
      sessionId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dialogflow request failed" });
  }
}
