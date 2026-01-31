/**
 * Follow-Up Orchestration Agent
 * Suggests next meetings, follow-ups, escalates pending decisions
 */

const watsonx = require('../config/watsonx');
const PROMPTS = require('../utils/prompts');
const JsonParser = require('../utils/jsonParser');

class FollowUpAgent {
  constructor() {
    this.name = 'Follow-Up Orchestration Agent';
  }

  /**
   * Generate follow-up recommendations
   * @param {object} structuredTranscript - Output from Understanding Agent
   * @param {object} actionItems - Output from Action Agent
   * @returns {object} Follow-up suggestions and escalations
   */
  async process(structuredTranscript, actionItems) {
    console.log(`[${this.name}] Generating follow-up recommendations...`);

    if (!structuredTranscript?.data) {
      throw new Error('Invalid structured transcript provided');
    }

    try {
      const prompt = PROMPTS.followUp(structuredTranscript.data, actionItems?.data || {}, structuredTranscript.rawTranscript);
      const response = await watsonx.generateText(prompt);

      // Parse JSON response
      const followUpData = this.parseResponse(response);

      // Enrich with priority scoring
      followUpData.followUpActions = this.prioritizeActions(followUpData.followUpActions || []);

      console.log(`[${this.name}] Generated ${followUpData.followUpActions.length} follow-up actions`);
      return {
        success: true,
        data: followUpData,
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
      console.error('Error parsing Follow-Up Agent response: Parsing failed');
      return {
        followUpActions: [],
        escalations: [],
        nextMeetingSuggestion: {
          recommended: false,
          suggestedTimeframe: 'Unable to determine',
          agenda: [],
          requiredAttendees: [],
        },
        parseError: true,
      };
    }

    // Ensure required arrays exist
    if (!parsed.followUpActions) {
      parsed.followUpActions = [];
    }
    if (!parsed.escalations) {
      parsed.escalations = [];
    }
    if (!parsed.nextMeetingSuggestion) {
      parsed.nextMeetingSuggestion = {
        recommended: false,
        suggestedTimeframe: 'Not specified',
        agenda: [],
        requiredAttendees: [],
      };
    }

    return parsed;
  }

  /**
   * Prioritize and score follow-up actions
   * @param {array} actions - Follow-up actions array
   * @returns {array} Actions with priority scores
   */
  prioritizeActions(actions) {
    const urgencyScores = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const typeScores = {
      escalation: 3,
      meeting: 2,
      email: 1,
      reminder: 1,
      review: 1,
    };

    return actions
      .map((action, index) => {
        const urgencyScore = urgencyScores[action.urgency?.toLowerCase()] || 1;
        const typeScore = typeScores[action.type?.toLowerCase()] || 1;
        const priorityScore = urgencyScore * 2 + typeScore;

        return {
          ...action,
          id: action.id || index + 1,
          priorityScore,
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }
}

module.exports = new FollowUpAgent();
