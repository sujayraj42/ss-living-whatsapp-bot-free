/**
 * availability.js — Fetch live room availability from SS Living backend
 *
 * Calls the existing backend API to get real-time
 * vacant/occupied room counts per building.
 */

const axios = require('axios');

/**
 * Fetch live room availability and return a formatted text string.
 * The AI includes this in its reply when students ask about vacancies.
 *
 * @returns {Promise<string>} Human-readable availability summary
 */
async function getAvailability() {
    const backendUrl = process.env.BACKEND_URL || 'https://shree-shyam-living.onrender.com/api';

    try {
        const response = await axios.get(`${backendUrl}/rooms/availability`, {
            timeout: 10000,
        });

        if (!response.data || !response.data.success) {
            return 'Could not fetch live availability right now. Please call +91 91422 72776 for the latest info.';
        }

        const buildings = response.data.data;

        if (!buildings || !Array.isArray(buildings) || buildings.length === 0) {
            return 'Availability data is not available right now. Please contact +91 91422 72776.';
        }

        let summary = '🏠 *Live Room Availability:*\n\n';

        for (const b of buildings) {
            const name = b.buildingName || b.name || b._id || 'Unknown';
            const total = b.totalRooms || b.total || 0;
            const vacant = b.vacantRooms || b.vacant || 0;
            const status = vacant > 0 ? `✅ ${vacant} vacant` : '❌ Full';
            summary += `• *${name}* — ${status} (out of ${total})\n`;
        }

        summary += '\n_Updated just now!_';
        return summary;
    } catch (err) {
        console.error('[Availability] ❌ Failed:', err.message);
        return 'Sorry, could not check availability right now. Please WhatsApp +91 91422 72776 — our team will reply instantly! 🙏';
    }
}

module.exports = { getAvailability };
