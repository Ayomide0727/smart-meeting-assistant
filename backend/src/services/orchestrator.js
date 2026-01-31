/**
 * Agent Orchestrator Service
 * Coordinates the workflow between all AI agents
 */

const understandingAgent = require('../agents/understandingAgent');
const actionAgent = require('../agents/actionAgent');
const followUpAgent = require('../agents/followUpAgent');
const qaAgent = require('../agents/qaAgent');

class Orchestrator {
  constructor() {
    this.name = 'Meeting Orchestrator';
    // Cache for structured transcripts (in production, use Redis or similar)
    this.sessionCache = new Map();
  }

  /**
   * Process complete meeting workflow
   * Runs all agents in sequence and aggregates results
   * @param {string} transcript - Raw meeting transcript
   * @param {string} sessionId - Optional session ID for caching
   * @returns {object} Aggregated results from all agents
   */
  async processComplete(transcript, sessionId = null) {
    console.log(`[${this.name}] Starting complete meeting processing...`);
    const startTime = Date.now();

    try {
      // Step 1: Understanding Agent - Structure the transcript
      console.log(`[${this.name}] Step 1/3: Running Understanding Agent`);
      const structuredTranscript = await understandingAgent.process(transcript);

      // Cache the structured transcript for Q&A
      if (sessionId) {
        this.sessionCache.set(sessionId, {
          structuredTranscript,
          timestamp: Date.now(),
        });
      }

      // Step 2: Action Agent - Extract action items
      console.log(`[${this.name}] Step 2/3: Running Action Agent`);
      const actionItems = await actionAgent.process(structuredTranscript);

      // Step 3: Follow-Up Agent - Generate recommendations
      console.log(`[${this.name}] Step 3/3: Running Follow-Up Agent`);
      const followUps = await followUpAgent.process(structuredTranscript, actionItems);

      const processingTime = Date.now() - startTime;
      console.log(`[${this.name}] Complete processing finished in ${processingTime}ms`);

      // Aggregate and return results
      return {
        success: true,
        sessionId: sessionId || this.generateSessionId(),
        processingTime: `${processingTime}ms`,
        data: {
          summary: structuredTranscript.data,
          actionItems: actionItems.data,
          followUps: followUps.data,
        },
        metadata: {
          participantCount: structuredTranscript.data.participants?.length || 0,
          actionItemCount: actionItems.data.actionItems?.length || 0,
          followUpCount: followUps.data.followUpActions?.length || 0,
          hasEscalations: (followUps.data.escalations?.length || 0) > 0,
          nextMeetingRecommended: followUps.data.nextMeetingSuggestion?.recommended || false,
        },
      };
    } catch (error) {
      console.error(`[${this.name}] Error in complete processing:`, error.message);
      throw error;
    }
  }

  /**
   * Get summary only
   * @param {string} transcript - Raw meeting transcript
   * @returns {object} Summary from Understanding Agent
   */
  async getSummary(transcript) {
    console.log(`[${this.name}] Getting summary only...`);

    const structuredTranscript = await understandingAgent.process(transcript);
    return {
      success: true,
      data: structuredTranscript.data,
    };
  }

  /**
   * Get action items only
   * @param {string} transcript - Raw meeting transcript
   * @returns {object} Action items from Action Agent
   */
  async getActionItems(transcript) {
    console.log(`[${this.name}] Getting action items only...`);

    const structuredTranscript = await understandingAgent.process(transcript);
    const actionItems = await actionAgent.process(structuredTranscript);
    return {
      success: true,
      data: actionItems.data,
    };
  }

  /**
   * Get follow-ups only
   * @param {string} transcript - Raw meeting transcript
   * @param {object} actionItemsData - Optional pre-computed action items
   * @returns {object} Follow-ups from Follow-Up Agent
   */
  async getFollowUps(transcript, actionItemsData = null) {
    console.log(`[${this.name}] Getting follow-ups only...`);

    const structuredTranscript = await understandingAgent.process(transcript);
    const actionItems = actionItemsData || (await actionAgent.process(structuredTranscript));
    const followUps = await followUpAgent.process(structuredTranscript, actionItems);
    return {
      success: true,
      data: followUps.data,
    };
  }

  /**
   * Answer a question about the meeting
   * @param {string} transcript - Raw meeting transcript
   * @param {string} question - User's question
   * @param {string} sessionId - Optional session ID to use cached data
   * @returns {object} Answer from Q&A Agent
   */
  async askQuestion(transcript, question, sessionId = null) {
    console.log(`[${this.name}] Processing Q&A...`);

    let structuredTranscript;

    // Try to use cached data if session ID provided
    if (sessionId && this.sessionCache.has(sessionId)) {
      const cached = this.sessionCache.get(sessionId);
      // Check if cache is less than 30 minutes old
      if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
        structuredTranscript = cached.structuredTranscript;
        console.log(`[${this.name}] Using cached transcript for session ${sessionId}`);
      }
    }

    // If no cache, process the transcript
    if (!structuredTranscript) {
      structuredTranscript = await understandingAgent.process(transcript);
    }

    const answer = await qaAgent.process(structuredTranscript, question);

    // Add suggested follow-up questions
    answer.data.suggestedQuestions = qaAgent.suggestQuestions(structuredTranscript);

    return {
      success: true,
      data: answer.data,
    };
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear session cache
   * @param {string} sessionId - Optional specific session to clear
   */
  clearCache(sessionId = null) {
    if (sessionId) {
      this.sessionCache.delete(sessionId);
    } else {
      this.sessionCache.clear();
    }
  }
}

module.exports = new Orchestrator();
