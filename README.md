# 🏠 SS Living — WhatsApp AI Chatbot

Smart WhatsApp chatbot for **Shree Shyam Living** PG near LPU, Phagwara.

Students message on WhatsApp → AI replies instantly in Hindi/English with room info, prices, and can book rooms automatically.

**Stack:** Meta WhatsApp Cloud API + Groq AI + Render.com

---

## 📁 Files

| File | What it does |
|------|-------------|
| `index.js` | Main server — webhook verification + message handling |
| `ai.js` | Groq AI with full SS Living knowledge |
| `whatsapp.js` | Send replies via Meta WhatsApp Cloud API |
| `availability.js` | Fetch live room vacancy from backend |
| `booking.js` | Auto-submit bookings to backend |
| `sessions.js` | Remember last 10 messages per student |

---

## 🚀 Setup Guide (Step by Step)

### Step 1: Get FREE Groq API Key (2 min)

1. Go to **https://console.groq.com**
2. Sign up with Google — free, no credit card
3. Click **"API Keys"** on the left
4. Click **"Create API Key"**
5. Copy the key and save it

### Step 2: Set up Meta WhatsApp Business (10 min)

1. Go to **https://developers.facebook.com**
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** type → click **"Next"**
4. Name it "SS Living Bot" → click **"Create App"**
5. Find **"WhatsApp"** in the products list → click **"Set Up"**
6. On the **"Get Started"** page you'll see:
   - **Temporary Access Token** — copy this (this is your `WHATSAPP_TOKEN`)
   - **Phone Number ID** — copy this too (this is your `WHATSAPP_PHONE_ID`)
7. **Important:** The temporary token expires every 24 hours. For permanent use:
   - Go to **Business Settings** → **System Users**
   - Create a system user → generate a permanent token

### Step 3: Deploy on Render.com (5 min)

1. Go to **https://render.com** and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select the **`ss-living-whatsapp-bot-free`** repository
5. Fill in settings:
   - **Name:** `ss-living-whatsapp-bot-free`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Click **"Environment"** tab and add these variables:

| Variable | Value |
|----------|-------|
| `WHATSAPP_TOKEN` | *(your token from Step 2)* |
| `WHATSAPP_PHONE_ID` | *(your Phone Number ID from Step 2)* |
| `WHATSAPP_VERIFY_TOKEN` | `ss_living_secret_2024` |
| `GROQ_API_KEY` | *(your key from Step 1)* |
| `BACKEND_URL` | `https://shree-shyam-living.onrender.com/api` |

7. Click **"Create Web Service"**
8. Wait 2-3 minutes for it to deploy
9. You'll get a URL like: `https://ss-living-whatsapp-bot-free.onrender.com`

### Step 4: Register Webhook on Meta (2 min)

1. Go to **https://developers.facebook.com** → your app → **WhatsApp** → **Configuration**
2. Under **Webhook**, click **"Edit"**
3. Enter:
   - **Callback URL:** `https://ss-living-whatsapp-bot-free.onrender.com/webhook`
   - **Verify Token:** `ss_living_secret_2024`
4. Click **"Verify and Save"**
5. Under **Webhook Fields**, click **"Manage"** and subscribe to: **`messages`**

### Step 5: Test It! 🎉

1. Open WhatsApp on your phone
2. Send a message to the WhatsApp Business number shown in Meta dashboard
3. The bot should reply within seconds ⚡

Try these:
- "Hi"
- "What rooms do you have?"
- "Sabse sasta room konsa hai?"
- "I want to book a room"

---

## ✅ Test Checklist

- [ ] Send "Hi" → Bot greets you and introduces SS Living
- [ ] Ask "Rooms kya hai?" → Bot lists properties with rent
- [ ] Ask "Cheapest room?" → Bot suggests NS Pariyal ₹6,500
- [ ] Ask "Room available hai?" → Bot fetches live availability
- [ ] Say "I want to book" → Bot asks for name, phone, college, property, date
- [ ] Give all 5 details → Bot confirms and submits booking
- [ ] Send a photo → Bot says "I can only read text messages"
- [ ] Ask in Hindi "Rent kitna hai?" → Bot replies in Hindi
- [ ] Visit your Render URL → Shows health check JSON

---

## 🔧 Troubleshooting

**Bot not replying?**
- Check if WHATSAPP_TOKEN hasn't expired (temporary tokens last 24 hours)
- Check Render logs: Render dashboard → your service → Logs
- Make sure you subscribed to the `messages` webhook field in Meta

**Webhook verification failing?**
- Make sure `WHATSAPP_VERIFY_TOKEN` in Render matches what you entered in Meta (`ss_living_secret_2024`)
- Make sure the Render service is running (not sleeping)

**Render service sleeping?**
- Free tier sleeps after 15 min of no traffic. First message after sleep takes ~30 seconds. This is normal.

---

## 📞 Contact

- **WhatsApp:** +91 91422 72776
- **Website:** https://shreeshyamliving.com
- **Backend:** https://shree-shyam-living.onrender.com

---

Built with ❤️ for SS Living students
