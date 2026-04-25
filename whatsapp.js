/**
 * whatsapp.js — Send messages via Green API (FREE)
 *
 * Green API lets you send WhatsApp messages for free.
 * API docs: https://green-api.com/en/docs/api/sending/SendMessage/
 *
 * Send URL format:
 *   POST https://api.green-api.com/waInstance{ID}/sendMessage/{TOKEN}
 *   Body: { "chatId": "919142272776@c.us", "message": "Hello!" }
 */

const axios = require('axios');

/**
 * Send a text message to a WhatsApp user via Green API.
 * Automatically splits messages longer than 4000 chars.
 *
 * @param {string} chatId - Recipient chatId (e.g. "919142272776@c.us")
 * @param {string} text - Message text to send
 */
async function sendMessage(chatId, text) {
    const instanceId = process.env.GREEN_API_INSTANCE;
    const token = process.env.GREEN_API_TOKEN;

    if (!instanceId || !token) {
        console.error('[WhatsApp] ❌ GREEN_API_INSTANCE or GREEN_API_TOKEN not set');
        return;
    }

    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;

    // Split long messages into chunks (WhatsApp limit ~4096 chars)
    const chunks = splitMessage(text);

    for (const chunk of chunks) {
        try {
            await axios.post(url, {
                chatId: chatId,
                message: chunk,
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000,
            });
        } catch (err) {
            console.error('[WhatsApp] ❌ Send failed:', err.response?.data || err.message);
        }
    }
}

/**
 * Split a long message into chunks that fit WhatsApp's limit.
 * Breaks at paragraph boundaries, then at newlines.
 *
 * @param {string} text
 * @returns {string[]}
 */
function splitMessage(text) {
    const MAX = 4000;
    if (text.length <= MAX) return [text];

    const chunks = [];
    const paragraphs = text.split('\n\n');
    let current = '';

    for (const para of paragraphs) {
        if ((current + '\n\n' + para).length > MAX) {
            if (current) chunks.push(current.trim());
            if (para.length > MAX) {
                // Single paragraph too long — split by lines
                const lines = para.split('\n');
                current = '';
                for (const line of lines) {
                    if ((current + '\n' + line).length > MAX) {
                        if (current) chunks.push(current.trim());
                        current = line;
                    } else {
                        current = current ? current + '\n' + line : line;
                    }
                }
            } else {
                current = para;
            }
        } else {
            current = current ? current + '\n\n' + para : para;
        }
    }
    if (current) chunks.push(current.trim());

    return chunks;
}

module.exports = { sendMessage };
