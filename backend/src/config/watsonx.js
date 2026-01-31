/**
 * IBM watsonx.ai Configuration
 * Handles authentication and API setup for watsonx services
 */

const axios = require('axios');

class WatsonxConfig {
  constructor() {
    this.apiKey = process.env.WATSONX_API_KEY || process.env.WATSONX_APIKEY || process.env.IBM_CLOUD_APIKEY;
    this.projectId = process.env.WATSONX_PROJECT_ID || process.env.PROJECT_ID;
    this.url = process.env.WATSONX_URL || process.env.WATSONX_AI_URL || 'https://us-south.ml.cloud.ibm.com';
    this.modelId = process.env.WATSONX_MODEL_ID || process.env.MODEL_ID || 'ibm/granite-13b-chat-v2';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get IBM Cloud IAM access token
   */
  async getAccessToken() {
    console.log('[WatsonxConfig] getAccessToken called');
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      console.log('[WatsonxConfig] Using cached token');
      return this.accessToken;
    }

    try {
      console.log('[WatsonxConfig] Requesting new token. API Key length:', this.apiKey ? this.apiKey.length : 0);
      const requestData = new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: this.apiKey,
      });
      console.log('[WatsonxConfig] URLSearchParams created');

      const response = await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        requestData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('[WatsonxConfig] Token response received. Status:', response.status);
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('[WatsonxConfig] Error getting access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with IBM Cloud: ' + (error.response?.data?.errorMessage || error.message));
    }
  }

  /**
   * Call watsonx.ai LLM API
   * @param {string} prompt - The prompt to send to the model
   * @param {object} parameters - Optional model parameters
   */
  async generateText(prompt, parameters = {}) {
    const token = await this.getAccessToken();

    const defaultParams = {
      decoding_method: 'greedy',
      max_new_tokens: 2000,
      min_new_tokens: 1,
      stop_sequences: [],
      repetition_penalty: 1.1,
    };

    const requestBody = {
      model_id: this.modelId,
      input: prompt,
      parameters: { ...defaultParams, ...parameters },
      project_id: this.projectId,
    };

    try {
      const response = await axios.post(
        `${this.url}/ml/v1/text/generation?version=2024-01-01`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      return response.data.results[0].generated_text;
    } catch (error) {
      console.error('Error calling watsonx.ai:', error.response?.data || error.message);
      throw new Error('Failed to generate text from watsonx.ai');
    }
  }

  /**
   * Validate configuration
   */
  isConfigured() {
    return !!(this.apiKey && this.projectId && this.url);
  }
}

// Export singleton instance
module.exports = new WatsonxConfig();
