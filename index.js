/**
 * index.js — SS Living WhatsApp AI Chatbot
 *
 * Stack: Meta WhatsApp Cloud API + Groq AI (free) + Render (free)
 *
 * How it works:
 * 1. Student sends WhatsApp message → Meta forwards to /webhook (POST)
 * 2. We send the message to Groq AI with conversation history
 * 3. AI generates a helpful reply (Hindi or English)
 * 4. If student asks about availability → fetches live data from backend
 * 5. If AI collected all booking details → auto-submits to backend
 * 6. Reply sent back to student via Meta WhatsApp Cloud API
 *
 * Webhook setup:
 * - GET  /webhook → Meta verification handshake (hub.challenge)
 * - POST /webhook → Receive incoming messages
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
        service: '🏠 SS Living WhatsApp AI Chatbot',
        status: 'running',
        version: '1.0.0',
        activeChats: activeCount(),
        groqReady: !!process.env.GROQ_API_KEY,
        whatsappReady: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
        uptime: Math.floor(process.uptime()) + 's',
        timestamp: new Date().toISOString(),
    });
});

// ══════════════════════════════════════
// ── Webhook Verification (GET) ──
// ══════════════════════════════════════
// When you register the webhook URL on Meta, it sends a GET request
// with hub.mode, hub.verify_token, and hub.challenge.
// You must respond with hub.challenge if the token matches.

app.get('/webhook', (req, res) => {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ss_living_secret_2024';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('[Webhook] ✅ Verified successfully');
        return res.status(200).send(challenge);
    }

    console.warn('[Webhook] ❌ Verification failed — token mismatch');
    return res.status(403).send('Forbidden');
});

// ══════════════════════════════════════
// ── Incoming Message Handler (POST) ──
// ══════════════════════════════════════
// Meta sends incoming WhatsApp messages as POST requests.
// IMPORTANT: Always respond 200 immediately — Meta retries on failures.
//
// Payload structure:
// {
//   "object": "whatsapp_business_account",
//   "entry": [{
//     "changes": [{
//       "value": {
//         "messages": [{
//           "from": "919142272776",
//           "type": "text",
//           "text": { "body": "Hi" }
//         }]
//       }
//     }]
//   }]
// }

app.post('/webhook', async (req, res) => {
    // Always respond 200 immediately so Meta doesn't retry
    res.status(200).json({ status: 'received' });

    try {
        const body = req.body;

        // Validate webhook payload structure
        if (!body?.object || !body?.entry?.[0]?.changes?.[0]?.value) {
            return;
        }

        const value = body.entry[0].changes[0].value;

        // Only process actual messages (ignore status updates: delivered, read, etc.)
        if (!value.messages || value.messages.length === 0) {
            return;
        }

        const message = value.messages[0];
        const from = message.from; // Sender's phone number e.g. "919142272776"

        // ── Handle non-text messages (image, audio, video, sticker, etc.) ──
        if (message.type !== 'text' || !message.text?.body) {
            await sendMessage(
                from,
                'I can only read text messages right now. Please type your question! ✍️'
            );
            return;
        }

        const userText = message.text.body.trim();
        console.log(`[Bot] 📩 From ${from}: "${userText}"`);

        // ── Get AI response ──
        const aiReply = await getReply(from, userText);

        // ── Check if AI wants to submit a booking ──
        const { cleanReply, bookingData } = extractBooking(aiReply);

        if (bookingData) {
            // Submit booking to backend (don't block the reply)
            submitBooking(bookingData).then((result) => {
                if (result.success) {
                    console.log(`[Bot] ✅ Booking submitted for ${bookingData.name}`);
                } else {
                    console.warn(`[Bot] ⚠️ Booking issue: ${result.message}`);
                    sendMessage(from, 'I could not submit your booking request automatically. Please call +91 91422 72776 and our team will help you right away! 🙏');
                }
            });
        }

        // ── Send reply to student ──
        if (cleanReply) {
            await sendMessage(from, cleanReply);
            console.log(`[Bot] 📤 Replied to ${from}`);
        }
    } catch (err) {
        console.error('[Bot] ❌ Error:', err);
    }
});

// ══════════════════════════════════════
// ── Start Server ──
// ══════════════════════════════════════

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  🏠 SS Living WhatsApp AI Chatbot');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Server:     http://localhost:${PORT}`);
    console.log(`  Webhook:    http://localhost:${PORT}/webhook`);
    console.log(`  Groq AI:    ${process.env.GROQ_API_KEY ? '✅ Ready' : '❌ Missing GROQ_API_KEY'}`);
    console.log(`  WhatsApp:   ${process.env.WHATSAPP_TOKEN ? '✅ Ready' : '❌ Missing WHATSAPP_TOKEN'}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
});
