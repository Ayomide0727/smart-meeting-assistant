
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.WATSONX_API_KEY;
const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
const projectId = process.env.WATSONX_PROJECT_ID;

async function listModels() {
  try {
    console.log('Fetching IAM token...');
    const tokenRes = await axios.post('https://iam.cloud.ibm.com/identity/token', 
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey
      }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const token = tokenRes.data.access_token;
    console.log('Token fetched. Fetching model list...');
    
    const response = await axios.get(`${url}/ml/v1/foundation_model_specs?version=2024-01-01`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    
    const models = response.data.resources.map(r => r.model_id);
    console.log('Available Models:', models);
    
    // Check if the current one is there
    const currentModel = process.env.WATSONX_MODEL_ID;
    console.log('Current Model in .env:', currentModel);
    console.log('Is current model available?', models.includes(currentModel));
    
  } catch (error) {
    console.error('Error listing models:', error.response?.data || error.message);
  }
}

listModels();
