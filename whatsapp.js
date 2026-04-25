/**
 * whatsapp.js — Send messages via Meta WhatsApp Cloud API
 *
 * Uses the official Meta/Facebook WhatsApp Business Cloud API.
 * Free tier: 1,000 service conversations/month.
 *
 * Send URL format:
 *   POST https://graph.facebook.com/v21.0/{PHONE_ID}/messages
 *   Headers: Authorization: Bearer {TOKEN}
 *   Body: { messaging_product: "whatsapp", to: "919142272776", type: "text", text: { body: "Hello!" } }
 */

const axios = require('axios');

const API_VERSION = 'v21.0';
const MAX_LENGTH = 4000; // WhatsApp limit is 4096, leave buffer

/**
 * Send a text message to a WhatsApp user via Meta Cloud API.
 * Automatically splits messages longer than 4000 chars.
 *
 * @param {string} to - Recipient phone number (e.g. "919142272776")
 * @param {string} text - Message text to send
 */
async function sendMessage(to, text) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
        console.error('[WhatsApp] ❌ WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set');
        return;
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;

    // Split long messages into chunks
    const chunks = splitMessage(text);

    for (const chunk of chunks) {
        try {
            await axios.post(url, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: { preview_url: true, body: chunk },
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });
        } catch (err) {
            console.error('[WhatsApp] ❌ Send failed:', err.response?.data?.error || err.message);
        }
    }
}

/**
 * Split a long message into chunks that fit WhatsApp's limit.
 * Breaks at paragraph boundaries, then at newlines.
 */
function splitMessage(text) {
    if (text.length <= MAX_LENGTH) return [text];

    const chunks = [];
    const paragraphs = text.split('\n\n');
    let current = '';

    for (const para of paragraphs) {
        if ((current + '\n\n' + para).length > MAX_LENGTH) {
            if (current) chunks.push(current.trim());
            if (para.length > MAX_LENGTH) {
                const lines = para.split('\n');
                current = '';
                for (const line of lines) {
                    if ((current + '\n' + line).length > MAX_LENGTH) {
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
