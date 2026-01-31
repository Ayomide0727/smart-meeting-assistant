
require('dotenv').config();
const watsonx = require('./src/config/watsonx');

async function testAuth() {
  console.log('Testing WatsonX Auth...');
  try {
    const token = await watsonx.getAccessToken();
    console.log('Token obtained successfully (first 10 chars):', token.substring(0, 10));
    
    console.log('Testing model generation with simple prompt...');
    const response = await watsonx.generateText('Say hello');
    console.log('Response:', response);
  } catch (error) {
    console.error('Auth/Generation Test Failed:', error);
  }
}

testAuth();
