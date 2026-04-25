/**
 * booking.js — Submit booking requests to SS Living backend
 *
 * When the AI collects all details from a student,
 * this module POSTs the booking to the existing backend.
 */

const axios = require('axios');

/**
 * Submit a booking request to the SS Living backend.
 *
 * @param {Object} data - Booking details collected by the AI
 * @param {string} data.name - Student's full name
 * @param {string} data.phone - Student's phone number
 * @param {string} data.college - College/university name
 * @param {string} data.buildingId - Preferred property name or ID
 * @param {string} data.moveInDate - Preferred move-in date
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitBooking(data) {
    const backendUrl = process.env.BACKEND_URL || 'https://shree-shyam-living.onrender.com/api';

    const payload = {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        college: data.college || '',
        buildingId: data.buildingId || '',
        preferredRoomType: data.preferredRoomType || '',
        moveInDate: data.moveInDate || '',
        leadSource: 'whatsapp',
        notes: 'Booked via FREE WhatsApp AI Chatbot (Shyam Bot)',
    };

    try {
        const response = await axios.post(`${backendUrl}/bookings`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
        });

        if (response.data && response.data.success) {
            console.log('[Booking] ✅ Submitted:', payload.name, payload.phone);
            return { success: true, message: 'Booking submitted successfully' };
        }

        console.warn('[Booking] ⚠️ Backend response:', response.data);
        return { success: false, message: 'Backend did not confirm' };
    } catch (err) {
        console.error('[Booking] ❌ Failed:', err.response?.data || err.message);
        return { success: false, message: err.message };
    }
}

/**
 * Extract booking JSON from the AI's response.
 * The AI outputs a ```BOOKING_JSON block when it has all 5 details.
 *
 * @param {string} aiReply - Raw AI response text
 * @returns {{ cleanReply: string, bookingData: Object|null }}
 */
function extractBooking(aiReply) {
    const match = aiReply.match(/```BOOKING_JSON\s*([\s\S]*?)```/);

    if (!match) {
        return { cleanReply: aiReply, bookingData: null };
    }

    let bookingData = null;
    try {
        bookingData = JSON.parse(match[1].trim());
    } catch (err) {
        console.error('[Booking] ❌ JSON parse error:', err.message);
    }

    // Remove JSON block from the message the student sees
    const cleanReply = aiReply.replace(/```BOOKING_JSON[\s\S]*?```/, '').trim();

    return { cleanReply, bookingData };
}

module.exports = { submitBooking, extractBooking };
