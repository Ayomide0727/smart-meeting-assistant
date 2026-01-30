/**
 * Meeting Understanding Agent
 * Cleans & structures transcript; detects decisions, risks, unresolved topics
 */

const watsonx = require('../config/watsonx');
const PROMPTS = require('../utils/prompts');

class UnderstandingAgent {
  constructor() {
    this.name = 'Meeting Understanding Agent';
  }

  /**
   * Process raw transcript and extract structured information
   * @param {string} transcript - Raw meeting transcript
   * @returns {object} Structured meeting data
   */
  async process(transcript) {
    console.log(`[${this.name}] Processing transcript...`);

    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript is empty or invalid');
    }

    try {
      const prompt = PROMPTS.understanding(transcript);
      const response = await watsonx.generateText(prompt);

      // Parse JSON response
      const structuredData = this.parseResponse(response);

      console.log(`[${this.name}] Successfully structured transcript`);
      return {
        success: true,
        data: structuredData,
        rawTranscript: transcript,
      };
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      throw error;
    }
  }

  /**
   * Parse and validate the AI response
   * @param {string} response - Raw AI response
   * @returns {object} Parsed JSON data
   */
  parseResponse(response) {
    try {
      // Clean response - remove any markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.slice(7);
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.slice(0, -3);
      }

      const parsed = JSON.parse(cleanResponse.trim());

      // Validate required fields
      const requiredFields = ['participants', 'keyPoints', 'decisions', 'meetingSummary'];
      for (const field of requiredFields) {
        if (!(field in parsed)) {
          parsed[field] = field === 'meetingSummary' ? 'No summary available' : [];
        }
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing Understanding Agent response:', error.message);
      // Return a default structure if parsing fails
      return {
        participants: [],
        keyPoints: [],
        decisions: [],
        unresolvedIssues: [],
        risks: [],
        topics: [],
        meetingSummary: 'Unable to parse meeting content',
        parseError: true,
      };
    }
  }
}

module.exports = new UnderstandingAgent();
