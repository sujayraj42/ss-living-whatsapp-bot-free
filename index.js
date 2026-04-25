/**
 * index.js — SS Living WhatsApp AI Chatbot (100% FREE)
 *
 * Stack: Green API (free) + Groq AI (free) + Render (free)
 * Total cost: ₹0 forever
 *
 * How it works:
 * 1. Student sends WhatsApp message → Green API forwards to /webhook
 * 2. We send the message to Groq AI with conversation history
 * 3. AI generates a helpful reply (Hindi or English)
 * 4. If student asks about availability → fetches live data from backend
 * 5. If AI collected all booking details → auto-submits to backend
 * 6. Reply sent back to student via Green API
 */

require('dotenv').config();

const express = require('express');
const { getReply } = require('./ai');
const { sendMessage } = require('./whatsapp');
const { extractBooking, submitBooking } = require('./booking');
const { activeCount } = require('./sessions');

const app = express();
app.use(express.json());

// ══════════════════════════════════════
// ── Health Check ──
// ══════════════════════════════════════

app.get('/', (req, res) => {
    res.json({
        service: '🏠 SS Living WhatsApp AI Chatbot (FREE)',
        status: 'running',
        version: '1.0.0',
        cost: '₹0 forever',
        activeChats: activeCount(),
        groqReady: !!process.env.GROQ_API_KEY,
        greenApiReady: !!(process.env.GREEN_API_INSTANCE && process.env.GREEN_API_TOKEN),
        uptime: Math.floor(process.uptime()) + 's',
        timestamp: new Date().toISOString(),
    });
});

// ══════════════════════════════════════
// ── Green API Webhook (POST) ──
// ══════════════════════════════════════
// Green API sends incoming WhatsApp messages here.
//
// Webhook payload format:
// {
//   "typeWebhook": "incomingMessageReceived",
//   "senderData": { "chatId": "919142272776@c.us", "sender": "919142272776@c.us" },
//   "messageData": {
//     "typeMessage": "textMessage",
//     "textMessageData": { "textMessage": "Hi" }
//   }
// }

app.post('/webhook', async (req, res) => {
    // Always respond 200 immediately so Green API doesn't retry
    res.status(200).json({ status: 'received' });

    try {
        const body = req.body;

        // Only process incoming messages (ignore status updates, etc.)
        if (!body || body.typeWebhook !== 'incomingMessageReceived') {
            return;
        }

        const chatId = body.senderData?.chatId;
        if (!chatId) {
            console.warn('[Bot] ⚠️ No chatId in webhook');
            return;
        }

        // Skip messages from group chats (only handle personal chats)
        if (chatId.includes('@g.us')) {
            return;
        }

        const messageData = body.messageData;
        if (!messageData) {
            return;
        }

        // ── Handle non-text messages ──
        if (messageData.typeMessage !== 'textMessage') {
            await sendMessage(
                chatId,
                'I can only read text messages right now. Please type your question! ✍️'
            );
            return;
        }

        const userText = messageData.textMessageData?.textMessage?.trim();
        if (!userText) {
            return;
        }

        console.log(`[Bot] 📩 From ${chatId}: "${userText}"`);

        // ── Get AI response ──
        const aiReply = await getReply(chatId, userText);

        // ── Check if AI wants to submit a booking ──
        const { cleanReply, bookingData } = extractBooking(aiReply);

        if (bookingData) {
            // Submit booking to backend (don't block the reply)
            submitBooking(bookingData).then((result) => {
                if (result.success) {
                    console.log(`[Bot] ✅ Booking submitted for ${bookingData.name}`);
                } else {
                    console.warn(`[Bot] ⚠️ Booking issue: ${result.message}`);
                    // Send fallback message if booking failed
                    sendMessage(chatId, 'I could not submit your booking request automatically. Please call +91 91422 72776 and our team will help you right away! 🙏');
                }
            });
        }

        // ── Send reply to student ──
        if (cleanReply) {
            await sendMessage(chatId, cleanReply);
            console.log(`[Bot] 📤 Replied to ${chatId}`);
        }
    } catch (err) {
        console.error('[Bot] ❌ Error:', err);
        // Don't crash — just log and continue
    }
});

// ══════════════════════════════════════
// ── Start Server ──
// ══════════════════════════════════════

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  🏠 SS Living WhatsApp AI Chatbot (FREE)');
    console.log('  💰 Total Cost: ₹0 forever');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Server:     http://localhost:${PORT}`);
    console.log(`  Webhook:    http://localhost:${PORT}/webhook`);
    console.log(`  Groq AI:    ${process.env.GROQ_API_KEY ? '✅ Ready' : '❌ Missing GROQ_API_KEY'}`);
    console.log(`  Green API:  ${process.env.GREEN_API_INSTANCE ? '✅ Ready' : '❌ Missing GREEN_API_INSTANCE'}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
});
