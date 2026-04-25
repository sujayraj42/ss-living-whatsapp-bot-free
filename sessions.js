/**
 * sessions.js — In-memory conversation store
 *
 * Keeps the last 10 messages per WhatsApp user so the AI
 * remembers what the student said earlier in the chat.
 * No database needed — stored in RAM.
 */

const store = new Map();
const MAX_MESSAGES = 10;

/**
 * Get conversation history for a user.
 * @param {string} chatId - WhatsApp phone number (e.g. "919142272776")
 * @returns {Array<{role: string, content: string}>}
 */
function getHistory(chatId) {
    if (!store.has(chatId)) {
        store.set(chatId, []);
    }
    return store.get(chatId);
}

/**
 * Add a message to conversation history.
 * Auto-trims to keep only the last 10 messages.
 * @param {string} chatId
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
function addMessage(chatId, role, content) {
    const history = getHistory(chatId);
    history.push({ role, content });
    while (history.length > MAX_MESSAGES) {
        history.shift();
    }
}

/**
 * Clear history for a user.
 * @param {string} chatId
 */
function clearHistory(chatId) {
    store.delete(chatId);
}

/**
 * Get total active conversations count.
 * @returns {number}
 */
function activeCount() {
    return store.size;
}

module.exports = { getHistory, addMessage, clearHistory, activeCount };
