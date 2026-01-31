/**
 * Knowledge / Q&A Agent
 * Answers targeted questions about meeting content
 */

const watsonx = require('../config/watsonx');
const PROMPTS = require('../utils/prompts');
const JsonParser = require('../utils/jsonParser');

class QAAgent {
  constructor() {
    this.name = 'Knowledge/Q&A Agent';
  }

  /**
   * Answer a question about the meeting
   * @param {object} structuredTranscript - Output from Understanding Agent
   * @param {string} question - User's question
   * @returns {object} Answer with confidence and context
   */
  async process(structuredTranscript, question) {
    console.log(`[${this.name}] Processing question: "${question}"`);

    if (!structuredTranscript?.data) {
      throw new Error('Invalid structured transcript provided');
    }

    if (!question || question.trim().length === 0) {
      throw new Error('Question is empty or invalid');
    }

    try {
      const prompt = PROMPTS.qa(structuredTranscript.data, question);
      const response = await watsonx.generateText(prompt);

      // Parse JSON response
      const qaData = this.parseResponse(response);

      console.log(`[${this.name}] Answered with ${qaData.confidence} confidence`);
      return {
        success: true,
        data: {
          question: question,
          ...qaData,
        },
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
      console.error('Error parsing Q&A Agent response: Parsing failed');
      return {
        answer: response.trim() || 'Unable to process your question.',
        confidence: 'low',
        relevantContext: [],
        relatedTopics: [],
        parseError: true,
      };
    }

    // Ensure required fields exist
    if (!parsed.answer) {
      parsed.answer = 'Unable to find an answer to your question based on the meeting content.';
    }
    if (!parsed.confidence) {
      parsed.confidence = 'low';
    }
    if (!parsed.relevantContext) {
      parsed.relevantContext = [];
    }
    if (!parsed.relatedTopics) {
      parsed.relatedTopics = [];
    }

    return parsed;
  }

  /**
   * Suggest related questions based on meeting content
   * @param {object} structuredTranscript - Meeting data
   * @returns {array} Suggested questions
   */
  suggestQuestions(structuredTranscript) {
    const suggestions = [];
    const data = structuredTranscript?.data;

    if (!data) return suggestions;

    // Suggest questions about participants
    if (data.participants?.length > 0) {
      suggestions.push(`What did ${data.participants[0]} contribute to the meeting?`);
    }

    // Suggest questions about decisions
    if (data.decisions?.length > 0) {
      suggestions.push('What decisions were made during the meeting?');
    }

    // Suggest questions about unresolved issues
    if (data.unresolvedIssues?.length > 0) {
      suggestions.push('What issues are still pending or unresolved?');
    }

    // Suggest questions about action items
    suggestions.push('What are the action items from this meeting?');
    suggestions.push('Who is responsible for each task?');

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }
}

module.exports = new QAAgent();
