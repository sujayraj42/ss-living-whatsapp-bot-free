# 🏠 SS Living — FREE WhatsApp AI Chatbot

**100% FREE forever. No credit card. No paid API. ₹0 cost.**

A smart WhatsApp chatbot for **Shree Shyam Living** PG near LPU, Phagwara.

Students message on WhatsApp → AI replies instantly in Hindi/English with room info, prices, and can book rooms automatically.

---

## 💰 Cost Breakdown

| Service | Cost | What it does |
|---------|------|-------------|
| Green API | ₹0 (free forever plan) | Sends & receives WhatsApp messages |
| Groq AI | ₹0 (free forever) | AI brain that answers student questions |
| Render.com | ₹0 (free tier) | Hosts this server 24/7 |
| **TOTAL** | **₹0/month** | **Forever free** |

---

## 📁 Files

| File | What it does |
|------|-------------|
| `index.js` | Main server — receives messages, sends replies |
| `ai.js` | Talks to Groq AI with full SS Living knowledge |
| `whatsapp.js` | Sends reply messages via Green API |
| `availability.js` | Checks live room vacancy from SS Living backend |
| `booking.js` | Submits bookings to SS Living backend |
| `sessions.js` | Remembers last 10 messages per student |

---

## 🚀 Setup (5 Steps — 15 Minutes Total)

### Step 1: Get FREE Groq API Key (2 min)

1. Go to **https://console.groq.com**
2. Sign up with Google — completely free, no credit card
3. Click **"API Keys"** on the left
4. Click **"Create API Key"**
5. Copy the key and save it somewhere

### Step 2: Get FREE Green API Account (5 min)

1. Go to **https://green-api.com**
2. Click **"Sign Up"** — choose the **FREE plan** (no credit card)
3. After signup, click **"Create Instance"**
4. You'll see a QR code on screen
5. Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
6. Scan the QR code with your phone camera
7. Once connected, you'll see:
   - **Instance ID** (a number like `1234567890`)
   - **Instance Token** (a long string like `abc123def456...`)
8. Copy both — you need them in Step 3

### Step 3: Deploy on Render.com (5 min)

1. Go to **https://render.com** and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select the **`ss-living-whatsapp-bot-free`** repository
5. Fill in these settings:
   - **Name:** `ss-living-whatsapp-bot-free`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Click **"Environment"** tab and add these variables:

| Variable | Value |
|----------|-------|
| `GREEN_API_INSTANCE` | *(your Instance ID from Step 2)* |
| `GREEN_API_TOKEN` | *(your Instance Token from Step 2)* |
| `GROQ_API_KEY` | *(your API key from Step 1)* |
| `BACKEND_URL` | `https://shree-shyam-living.onrender.com/api` |
| `PORT` | `3000` |

7. Click **"Create Web Service"**
8. Wait 2-3 minutes for it to deploy
9. You'll get a URL like: `https://ss-living-whatsapp-bot-free.onrender.com`

### Step 4: Set Webhook in Green API (2 min)

1. Go to **https://green-api.com** → log in
2. Click on your instance
3. Go to **"Settings"** or **"Webhook Settings"**
4. In the **Webhook URL** field, paste:
   ```
   https://ss-living-whatsapp-bot-free.onrender.com/webhook
   ```
5. Make sure these webhook types are ON:
   - ✅ `incomingMessageReceived`
6. Click **Save**

### Step 5: Test It! 🎉

1. Open WhatsApp on any phone
2. Send a message to the number you connected in Step 2
3. **You should get an AI reply within 3 seconds!** ⚡

Try these messages:
- "Hi"
- "What rooms do you have?"
- "Sabse sasta room konsa hai?"
- "I want to book a room"

---

## ✅ Test Checklist

After deploying, check these:

- [ ] Send "Hi" → Bot greets you and introduces SS Living
- [ ] Ask "Rooms kya hai?" → Bot lists properties with rent
- [ ] Ask "Cheapest room?" → Bot suggests NS Pariyal ₹6,500
- [ ] Ask "Room available hai?" → Bot fetches live availability
- [ ] Say "I want to book" → Bot asks for name, phone, college, property, date
- [ ] Give all 5 details → Bot confirms and submits booking
- [ ] Send a photo → Bot says "I can only read text messages"
- [ ] Ask in Hindi "Rent kitna hai?" → Bot replies in Hindi
- [ ] Visit your Render URL in browser → Shows health check JSON

---

## 🔧 Troubleshooting

**Bot not replying?**
- Check if Green API instance is connected (green dot on dashboard)
- Check if webhook URL is correctly pasted in Green API settings
- Check Render logs for errors: go to Render dashboard → your service → Logs

**Green API disconnected?**
- Go to green-api.com → your instance → scan QR code again

**Render service sleeping?**
- Free tier sleeps after 15 min of no traffic. First message after sleep takes ~30 seconds. This is normal.

---

## 📞 Contact

- **WhatsApp:** +91 91422 72776
- **Website:** https://shreeshyamliving.com
- **Backend:** https://shree-shyam-living.onrender.com

---

Built with ❤️ for SS Living students | 💰 Total cost: ₹0 forever
