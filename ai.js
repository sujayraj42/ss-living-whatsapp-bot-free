/**
 * ai.js — Groq AI integration (FREE forever)
 *
 * Uses Groq's free llama-3.3-70b-versatile model.
 * Contains the complete SS Living system prompt.
 * Auto-fetches live availability when students ask about rooms.
 */

const axios = require('axios');
const { getHistory, addMessage } = require('./sessions');
const { getAvailability } = require('./availability');

// ══════════════════════════════════════
// ── System Prompt ──
// ══════════════════════════════════════

const SYSTEM_PROMPT = `You are Shyam, the friendly AI assistant for Shree Shyam Living — premium student PG near LPU university, Phagwara, Punjab, India.

Help students find rooms, answer questions, and book visits. Be warm and friendly. Reply in the same language the student uses (Hindi or English).

PROPERTIES AND MONTHLY RENT:
- SP Bhargav 1: ₹12,000 | 30 rooms | Fully Furnished | Flagship
- SP Bhargav 2: ₹12,000 | 5 rooms | Fully Furnished
- SP Bhargav 3: ₹12,000 | 5 rooms | Fully Furnished
- Suncity Homes: ₹11,500 | 32 rooms | Fully Furnished
- Comfort Corner: ₹10,000 | 11 rooms | Fully Furnished
- Krishna 2: ₹10,000 | 21 rooms | Fully Furnished
- Diamond Home: ₹10,000 | 9 rooms | Fully Furnished
- Shivalik: ₹10,000 | 16 rooms | Fully Furnished
- APH Apartment: ₹9,800 | 14 rooms | Fully Furnished
- Ambey Apartment 1: ₹9,000 | 11 rooms | Semi-Furnished
- Ambey Apartment 2: ₹9,000 | 7 rooms | Semi-Furnished
- Parabh Apartment: ₹9,000 | 7 rooms | Fully Furnished
- SKG Apartment: ₹7,500 | 7 rooms | Semi-Furnished
- Guruji Kirpa Villa: ₹7,000 | 18 rooms | Fully Furnished
- Blessing PG: ₹7,000 | 6 rooms | Semi-Furnished + meals
- NS Pariyal: ₹6,500 | 6 rooms | Fully Furnished | Most affordable

FACILITIES: WiFi, CCTV, power backup, RO water, attached bathroom, geyser, study table, wardrobe, double bed, housekeeping, parking

RULES: Gate 10:30 PM | No smoking | Visitors till 8 PM | Quiet after 10 PM

CONTACT: +91 91422 72776 | shreeshyamliving.com

BOOKING: When student wants to book, collect these one by one in a natural conversational way:
1. Full name
2. Phone number
3. College name
4. Preferred property or budget
5. Move-in date

Once you have ALL 5 details, output EXACTLY this JSON block:

\`\`\`BOOKING_JSON
{
  "name": "student full name",
  "phone": "their phone number",
  "college": "their college",
  "buildingId": "property name from list",
  "moveInDate": "YYYY-MM-DD or their stated date"
}
\`\`\`

Then immediately say: "Done! 🎉 Your request is submitted. Our team will call you within 2 hours to confirm your room."

IMPORTANT RULES:
- Keep replies short (2-3 paragraphs max) — students read on phones
- Use emojis occasionally to stay warm 🏠✨
- If asked something unrelated to PG/rooms, politely redirect
- Never make up availability numbers — say "let me check" or share the contact
- Always be encouraging about SS Living — mention proximity to LPU, safety, affordability`;

// ══════════════════════════════════════
// ── AI Response Generator ──
// ══════════════════════════════════════

/**
 * Get an AI response for a student's message.
 * Auto-fetches live availability when they ask about vacancies.
 *
 * @param {string} chatId - Green API chatId (e.g. "919142272776@c.us")
 * @param {string} userMessage - The text message from the student
 * @returns {Promise<string>} AI-generated reply text
 */
async function getReply(chatId, userMessage) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error('[AI] ❌ GROQ_API_KEY is not set');
        return 'Sorry, I am having trouble. Please call +91 91422 72776 🙏';
    }

    // Save user message to history
    addMessage(chatId, 'user', userMessage);

    // Check if student is asking about room availability
    const lower = userMessage.toLowerCase();
    const wantsAvailability =
        lower.includes('available') ||
        lower.includes('availability') ||
        lower.includes('vacant') ||
        lower.includes('vacancy') ||
        lower.includes('khali') ||
        lower.includes('room milega') ||
        lower.includes('room hai') ||
        lower.includes('kitne room') ||
        lower.includes('how many room') ||
        lower.includes('koi room');

    // Build messages array for Groq
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    // If they asked about availability, fetch live data and inject it
    if (wantsAvailability) {
        const liveData = await getAvailability();
        messages.push({
            role: 'system',
            content: `LIVE AVAILABILITY DATA (share this with the student):\n\n${liveData}`,
        });
    }

    // Add conversation history
    messages.push(...getHistory(chatId));

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.9,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        const reply = response.data.choices[0].message.content.trim();

        // Save assistant reply to history
        addMessage(chatId, 'assistant', reply);

        return reply;
    } catch (err) {
        console.error('[AI] ❌ Groq error:', err.response?.data || err.message);
        return 'Sorry, I am having trouble. Please call +91 91422 72776 🙏';
    }
}

module.exports = { getReply };
