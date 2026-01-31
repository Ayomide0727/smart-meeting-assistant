/**
 * Meeting Understanding Agent
 * Cleans & structures transcript; detects decisions, risks, unresolved topics
 */

const watsonx = require('../config/watsonx');
const PROMPTS = require('../utils/prompts');
const JsonParser = require('../utils/jsonParser');

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
    const parsed = JsonParser.extractAndParseJSON(response);

    if (!parsed) {
      console.error('Error parsing Understanding Agent response: Parsing failed');
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

    // Validate required fields
    const requiredFields = ['participants', 'keyPoints', 'decisions', 'meetingSummary'];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        parsed[field] = field === 'meetingSummary' ? 'No summary available' : [];
      }
    }

    return parsed;
  }
}

module.exports = new UnderstandingAgent();
