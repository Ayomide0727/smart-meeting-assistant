/**
 * Action & Ownership Agent
 * Extracts tasks, assigns owners if mentioned, flags missing owners
 */

const watsonx = require('../config/watsonx');
const PROMPTS = require('../utils/prompts');
const JsonParser = require('../utils/jsonParser');

class ActionAgent {
  constructor() {
    this.name = 'Action & Ownership Agent';
  }

  /**
   * Extract action items from structured transcript
   * @param {object} structuredTranscript - Output from Understanding Agent
   * @returns {object} Action items with ownership details
   */
  async process(structuredTranscript) {
    console.log(`[${this.name}] Extracting action items...`);

    if (!structuredTranscript || !structuredTranscript.data) {
      throw new Error('Invalid structured transcript provided');
    }

    try {
      const prompt = PROMPTS.actionItems(structuredTranscript.data, structuredTranscript.rawTranscript);
      const response = await watsonx.generateText(prompt);

      // Parse JSON response
      const actionData = this.parseResponse(response);

      // Post-process to ensure proper flagging
      actionData.actionItems = this.flagUnassignedItems(actionData.actionItems || []);

      console.log(`[${this.name}] Extracted ${actionData.actionItems.length} action items`);
      return {
        success: true,
        data: actionData,
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
      console.error('Error parsing Action Agent response: Parsing failed');
      return {
        actionItems: [],
        summary: {
          totalTasks: 0,
          assignedTasks: 0,
          unassignedTasks: 0,
          flaggedItems: 0,
        },
        parseError: true,
      };
    }

    // Ensure actionItems array exists
    if (!parsed.actionItems) {
      parsed.actionItems = [];
    }

    // Ensure summary exists
    if (!parsed.summary) {
      parsed.summary = {
        totalTasks: parsed.actionItems.length,
        assignedTasks: 0,
        unassignedTasks: 0,
        flaggedItems: 0,
      };
    }

    return parsed;
  }

  /**
   * Flag items without proper assignment
   * @param {array} items - Action items array
   * @returns {array} Items with proper flagging
   */
  flagUnassignedItems(items) {
    let assignedCount = 0;
    let unassignedCount = 0;

    const processedItems = items.map((item, index) => {
      const isUnassigned =
        !item.owner ||
        item.owner === 'UNASSIGNED' ||
        item.owner.toLowerCase() === 'unassigned' ||
        item.owner.toLowerCase() === 'tbd' ||
        item.owner.toLowerCase() === 'unknown';

      if (isUnassigned) {
        unassignedCount++;
        return {
          ...item,
          id: item.id || index + 1,
          owner: 'UNASSIGNED',
          flagged: true,
          flagReason: 'No owner assigned to this task',
        };
      }

      assignedCount++;
      return {
        ...item,
        id: item.id || index + 1,
        flagged: false,
      };
    });

    return processedItems;
  }
}

module.exports = new ActionAgent();
