/**
 * JSON Parsing Utility
 * robustly extracts and parses JSON from potentially messy AI responses
 */

class JsonParser {
  /**
   * Extract and parse JSON from a string that might contain other text
   * @param {string} text - The raw text containing JSON
   * @returns {object|null} Parsed JSON object or null if parsing fails
   */
  static extractAndParseJSON(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // 1. Try direct parsing first
    try {
      return JSON.parse(text);
    } catch (e) {}

    // 2. Try to find all candidate JSON blocks
    // We'll look for all '{' and try to match them with '}' from right to left
    const candidates = [];
    
    // Find all opening braces
    let pos = -1;
    while ((pos = text.indexOf('{', pos + 1)) !== -1) {
      // For each '{', try matching it with all '}' that come after it, 
      // starting from the very last '}' in the text (most likely to be the full block)
      let lastPos = text.length;
      while ((lastPos = text.lastIndexOf('}', lastPos - 1)) !== -1 && lastPos > pos) {
        candidates.push(text.substring(pos, lastPos + 1));
      }
    }

    // Also find all opening brackets (for array root)
    pos = -1;
    while ((pos = text.indexOf('[', pos + 1)) !== -1) {
      let lastPos = text.length;
      while ((lastPos = text.lastIndexOf(']', lastPos - 1)) !== -1 && lastPos > pos) {
        candidates.push(text.substring(pos, lastPos + 1));
      }
    }

    // 3. Sort candidates
    // Priority:
    // 1. Objects {} before Arrays []
    // 2. Length (Longer is better - covers nested structures)
    // 3. Position (Later is better - often final answer)
    candidates.sort((a, b) => {
      const aIsObject = a.trim().startsWith('{');
      const bIsObject = b.trim().startsWith('{');
      
      if (aIsObject && !bIsObject) return -1;
      if (!aIsObject && bIsObject) return 1;
      
      if (b.length !== a.length) return b.length - a.length;
      
      return text.lastIndexOf(b) - text.lastIndexOf(a);
    });

    // 4. Try parsing each candidate
    for (const candidate of candidates) {
      try {
        // Clean up common issues like markdown markers inside the candidate
        let cleanCandidate = candidate.trim();
        if (cleanCandidate.startsWith('```json')) cleanCandidate = cleanCandidate.slice(7);
        if (cleanCandidate.startsWith('```')) cleanCandidate = cleanCandidate.slice(3);
        if (cleanCandidate.endsWith('```')) cleanCandidate = cleanCandidate.slice(0, -3);
        
        return JSON.parse(cleanCandidate.trim());
      } catch (err) {
        // Continue to next candidate
      }
    }

    // 5. Final fallback: cleaning and simple extraction logic
    try {
      let simpleClean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const first = simpleClean.indexOf('{');
      const last = simpleClean.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        return JSON.parse(simpleClean.substring(first, last + 1));
      }
    } catch (e) {}

    return null;
  }
}

module.exports = JsonParser;
