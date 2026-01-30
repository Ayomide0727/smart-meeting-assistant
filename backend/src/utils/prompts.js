/**
 * AI Prompt Templates for Meeting Assistant Agents
 * Each agent has specific prompts designed for its role
 */

const PROMPTS = {
  /**
   * Meeting Understanding Agent Prompt
   * Cleans and structures the transcript, identifies key elements
   */
  understanding: (transcript) => `
You are a Meeting Understanding Agent. Your role is to analyze meeting transcripts and extract structured information.

TASK: Analyze the following meeting transcript and provide a structured summary.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Identify all participants mentioned in the meeting
2. Extract key discussion points
3. Identify decisions that were made
4. Note any unresolved issues or pending decisions
5. Flag any risks or concerns mentioned
6. Identify the main topics discussed

OUTPUT FORMAT (JSON):
{
  "participants": ["list of participant names"],
  "keyPoints": ["list of main discussion points"],
  "decisions": ["list of decisions made"],
  "unresolvedIssues": ["list of pending items or unresolved topics"],
  "risks": ["list of risks or concerns mentioned"],
  "topics": ["list of main topics discussed"],
  "meetingSummary": "A brief 2-3 sentence summary of the meeting"
}

Respond ONLY with valid JSON, no additional text.
`,

  /**
   * Action & Ownership Agent Prompt
   * Extracts action items and assigns ownership
   */
  actionItems: (structuredTranscript) => `
You are an Action & Ownership Agent. Your role is to extract action items from meeting content and identify task ownership.

TASK: Analyze the following structured meeting content and extract all action items.

MEETING CONTENT:
${JSON.stringify(structuredTranscript, null, 2)}

INSTRUCTIONS:
1. Identify all tasks or action items mentioned
2. For each task, determine:
   - Who is responsible (owner)
   - What is the deadline (if mentioned)
   - Priority level (high/medium/low based on context)
3. Flag tasks with NO clear owner as "UNASSIGNED"
4. Flag tasks with NO deadline as "NO_DEADLINE"

OUTPUT FORMAT (JSON):
{
  "actionItems": [
    {
      "id": 1,
      "task": "Description of the task",
      "owner": "Person name or UNASSIGNED",
      "deadline": "Date/time or NO_DEADLINE",
      "priority": "high|medium|low",
      "status": "pending",
      "flagged": true/false (true if owner is UNASSIGNED)
    }
  ],
  "summary": {
    "totalTasks": number,
    "assignedTasks": number,
    "unassignedTasks": number,
    "flaggedItems": number
  }
}

Respond ONLY with valid JSON, no additional text.
`,

  /**
   * Follow-Up Orchestration Agent Prompt
   * Generates follow-up recommendations
   */
  followUp: (structuredTranscript, actionItems) => `
You are a Follow-Up Orchestration Agent. Your role is to suggest follow-up actions and next steps based on meeting outcomes.

TASK: Analyze the meeting content and action items, then recommend follow-up actions.

MEETING CONTENT:
${JSON.stringify(structuredTranscript, null, 2)}

ACTION ITEMS:
${JSON.stringify(actionItems, null, 2)}

INSTRUCTIONS:
1. Identify items that need escalation
2. Suggest follow-up meetings if needed
3. Recommend communication actions
4. Flag urgent items that need immediate attention
5. Suggest timeline for next steps

OUTPUT FORMAT (JSON):
{
  "followUpActions": [
    {
      "id": 1,
      "action": "Description of follow-up action",
      "type": "meeting|email|escalation|reminder|review",
      "urgency": "high|medium|low",
      "suggestedDate": "recommended date or timeframe",
      "involvedParties": ["list of people involved"],
      "reason": "Why this follow-up is needed"
    }
  ],
  "escalations": [
    {
      "issue": "Description of issue to escalate",
      "escalateTo": "Person or role to escalate to",
      "reason": "Why escalation is needed"
    }
  ],
  "nextMeetingSuggestion": {
    "recommended": true/false,
    "suggestedTimeframe": "e.g., 'within 1 week'",
    "agenda": ["suggested agenda items"],
    "requiredAttendees": ["list of required attendees"]
  }
}

Respond ONLY with valid JSON, no additional text.
`,

  /**
   * Knowledge/Q&A Agent Prompt
   * Answers questions about the meeting
   */
  qa: (structuredTranscript, question) => `
You are a Knowledge/Q&A Agent. Your role is to answer specific questions about meeting content.

TASK: Answer the user's question based on the meeting content provided.

MEETING CONTENT:
${JSON.stringify(structuredTranscript, null, 2)}

USER QUESTION:
${question}

INSTRUCTIONS:
1. Answer the question based ONLY on the meeting content provided
2. If the answer is not in the meeting content, say so clearly
3. Be concise but complete in your answer
4. Quote relevant parts of the meeting when helpful
5. If the question is about a specific person, focus on their contributions/tasks

OUTPUT FORMAT (JSON):
{
  "answer": "Your detailed answer to the question",
  "confidence": "high|medium|low",
  "relevantContext": ["quotes or points from meeting that support the answer"],
  "relatedTopics": ["other related topics from the meeting the user might want to know about"]
}

Respond ONLY with valid JSON, no additional text.
`,
};

module.exports = PROMPTS;
