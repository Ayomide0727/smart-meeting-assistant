/**
 * Google Gemini AI Configuration
 * Handles initialization and setup for Gemini API
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiConfig {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      console.warn("[GeminiConfig] Warning: GEMINI_API_KEY is not set. Gemini features will be disabled.");
      return;
    }

    this.client = new GoogleGenerativeAI(this.apiKey);
    this.modelName = "gemini-pro";
  }

  /**
   * Get the Gemini model instance
   */
  getModel() {
    return this.client.getGenerativeModel({ model: this.modelName });
  }

  /**
   * Generate content using Gemini
   * @param {string} prompt - The prompt text
   * @returns {Promise<string>} Generated content
   */
  async generateContent(prompt) {
    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating content with Gemini:", error.message);
      throw new Error("Failed to generate content with Gemini");
    }
  }

  /**
   * Stream content using Gemini
   * @param {string} prompt - The prompt text
   * @returns {Promise<string>} Streamed content
   */
  async streamContent(prompt) {
    try {
      const model = this.getModel();
      const result = await model.generateContentStream(prompt);
      let fullResponse = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
      }

      return fullResponse;
    } catch (error) {
      console.error("Error streaming content with Gemini:", error.message);
      throw new Error("Failed to stream content with Gemini");
    }
  }
}

// Create singleton instance
let instance = null;

/**
 * Get or create Gemini config instance
 */
function getGeminiConfig() {
  if (!instance) {
    instance = new GeminiConfig();
    console.log("[GeminiConfig] Initialized successfully");
  }
  return instance;
}

module.exports = getGeminiConfig();
