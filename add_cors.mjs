import { createClient } from '@sanity/client';

const client = createClient({
  projectId: "nkccolc2",
  dataset: "production",
  apiVersion: '2024-04-20',
  token: process.env.SANITY_TOKEN || "skN4MFrg5YC6UeltOD09t60aSMXbSsJG1ulpRoJs9zMSL0BGqT1e4pUijZplUlRTQWWgq8YiiNZPjMTnlQkixwKlIBKnzrtyG9jIeXxkr2xUXjwY2BTwoYt1OscifAwiU5CbRIrZi1ZPS4UKw3AXg4cH5ne45mGMCmG8otWVcUY6KstP2vtZ",
  useCdn: false
});

async function addCors() {
  try {
    await client.request({
      uri: `/cors`,
      method: 'POST',
      body: {
        origin: 'http://localhost:3000',
      }
    });
    console.log("CORS added for http://localhost:3000");
  } catch (err) {
    console.error("Failed to add CORS", err.response?.body || err.message);
  }
}

addCors();
