
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.WATSONX_API_KEY;
const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
const projectId = process.env.WATSONX_PROJECT_ID;

async function listModels() {
  try {
    console.log('Using API Key:', apiKey ? '***' + apiKey.slice(-4) : 'MISSING');
    console.log('Using Project ID:', projectId);
    console.log('Using URL:', url);

    console.log('\nFetching IAM token...');
    const tokenRes = await axios.post('https://iam.cloud.ibm.com/identity/token', 
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey
      }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const token = tokenRes.data.access_token;
    console.log('Token fetched. Length:', token.length);
    
    console.log('\nFetching foundation model specifications...');
    const response = await axios.get(`${url}/ml/v1/foundation_model_specs?version=2024-01-01`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    
    const models = response.data.resources.map(r => r.model_id);
    console.log('\nTotal Models Available:', models.length);
    console.log('Models (alphabetical):');
    models.sort().forEach(m => console.log(' -', m));
    
    const currentModel = process.env.WATSONX_MODEL_ID;
    console.log('\nCurrent Model in .env:', currentModel);
    console.log('Is current model available?', models.includes(currentModel));
    
  } catch (error) {
    console.error('\nError Details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

listModels();
