/**
 * Meeting API Routes
 * Handles all meeting-related endpoints
 */

const express = require('express');
const router = express.Router();
const orchestrator = require('../services/orchestrator');

/**
 * @route   POST /api/meeting/process
 * @desc    Process complete meeting transcript (all agents)
 * @access  Public
 */
router.post('/process', async (req, res) => {
  try {
    const { transcript, sessionId } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required',
      });
    }

    const result = await orchestrator.processComplete(transcript, sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error processing meeting:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process meeting transcript',
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/meeting/summary
 * @desc    Get meeting summary only
 * @access  Public
 */
router.post('/summary', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required',
      });
    }

    const result = await orchestrator.getSummary(transcript);
    res.json(result);
  } catch (error) {
    console.error('Error getting summary:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/meeting/actions
 * @desc    Get action items only
 * @access  Public
 */
router.post('/actions', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required',
      });
    }

    const result = await orchestrator.getActionItems(transcript);
    res.json(result);
  } catch (error) {
    console.error('Error getting action items:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to extract action items',
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/meeting/followups
 * @desc    Get follow-up suggestions
 * @access  Public
 */
router.post('/followups', async (req, res) => {
  try {
    const { transcript, actionItems } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required',
      });
    }

    const result = await orchestrator.getFollowUps(transcript, actionItems);
    res.json(result);
  } catch (error) {
    console.error('Error getting follow-ups:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate follow-up suggestions',
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/meeting/qa
 * @desc    Ask a question about the meeting
 * @access  Public
 */
router.post('/qa', async (req, res) => {
  try {
    const { transcript, question, sessionId } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required',
      });
    }

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    const result = await orchestrator.askQuestion(transcript, question, sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in Q&A:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to answer question',
      message: error.message,
    });
  }
});

/**
 * @route   DELETE /api/meeting/cache/:sessionId
 * @desc    Clear session cache
 * @access  Public
 */
router.delete('/cache/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    orchestrator.clearCache(sessionId);
    res.json({
      success: true,
      message: `Cache cleared for session ${sessionId}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

module.exports = router;
