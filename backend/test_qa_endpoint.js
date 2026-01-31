
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api/meeting/qa';

const sampleTranscript = `
John: Welcome everyone. Today we need to decide on the launch date.
Sarah: I propose March 15th.
John: Agreed. David, please prepare the marketing plan by next Tuesday.
David: Will do. I'll need the tech specs from Sarah.
Sarah: I'll send them by EOD today.
`;

async function testQA() {
  console.log('Testing Q&A endpoint...');
  try {
    const response = await axios.post(API_URL, {
      transcript: sampleTranscript,
      question: "What did David agree to?",
      sessionId: "test_session_" + Date.now()
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error Details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testQA();
