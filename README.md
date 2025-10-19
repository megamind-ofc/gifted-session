# Gifted-Session-Generator
- Fork, Star and Edit as you wish
- Deploy to your favourite hosting server eg Heroku or Render or self hosting
- This is what I use in my **[Session Site](https://session.giftedtech.co.ke)** so don't ask for more...

## NEW: MongoDB Session Storage

This session generator now stores session data in MongoDB and provides short session IDs for easy use in your bot.

### How It Works

1. **User generates session**: User scans QR code or uses pairing code
2. **Data stored in MongoDB**: The compressed session data is stored in MongoDB
3. **Short ID returned**: User receives a short session ID like `Darex~abc123` (only 6 characters)
4. **Bot retrieves session**: Bot fetches the full session data from the API using the short ID

### Usage in Your Bot

<details>
<summary>SAMPLE USAGE IN BOT</summary>
   
```js
// 1. IN YOUR LIB OR SOMEWHERE YOU LIKE:
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const axios = require('axios');
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
const createDirIfNotExist = dir => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

createDirIfNotExist(sessionDir);

async function loadSession(SESSION_ID, sessionSiteUrl) {
    try {
        if (fs.existsSync(credsPath)) {
            fs.unlinkSync(credsPath);
            console.log("♻️ Old session removed");
        }

        if (!SESSION_ID || typeof SESSION_ID !== 'string') {
            throw new Error("❌ SESSION_ID is missing or invalid");
        }

        const [header, sessionId] = SESSION_ID.split('~');

        if (header !== "Darex" || !sessionId) {
            throw new Error("❌ Invalid session format. Expected 'Darex~......'");
        }

        // Fetch session data from the API
        console.log("📥 Fetching session data from server...");
        const response = await axios.get(`${sessionSiteUrl}/session/${sessionId}`);
        
        if (!response.data.success) {
            throw new Error("❌ Failed to retrieve session data");
        }

        const b64data = response.data.data;
        const compressedData = Buffer.from(b64data, 'base64');
        const decompressedData = zlib.gunzipSync(compressedData);

        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        fs.writeFileSync(credsPath, decompressedData, "utf8");
        console.log("✅ Session loaded successfully");

    } catch (e) {
        console.error("❌ Session Error:", e.message);
        throw e;
    }
}

module.exports = { loadSession }


// 2. IN YOUR BOT START FILE (INDEX.JS/CLIENT.JS):
const { loadSession } = require("./lib");

// Your bot configuration
const config = {
    SESSION_ID: 'Darex~abc123',  // Short session ID from the generator
    SESSION_SITE: 'https://your-session-site.com'  // Your deployed session site URL
};

async function ConnectToWA() {
    // Load session from MongoDB via API
    await loadSession(config.SESSION_ID, config.SESSION_SITE);
    
    console.log('⏱️ Connecting to WhatsApp ⏱️');
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/session/');
    var { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: !config.SESSION_ID,
        auth: state
        // ... your other options
    });
    
    sock.ev.on('creds.update', saveCreds);
    // ... rest of your bot code
}

ConnectToWA();
```

</details>

<details>
<summary>MORE INFO</summary>
   
**NB:** This repo generates session IDs for all bots using gifted-baileys/whiskeysockets/baileys with ***zlib*** compression.

The new system uses MongoDB to store session data, so your bot only needs:
- The short session ID (e.g., `Darex~abc123`)
- The session site URL

**No MongoDB URI needed in your bot!** The session site handles all database operations.

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#table-of-contents)
<br/>WEB - PAIR CODE FOR BOTS WITH GIFTED-BAILEYS
[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#table-of-contents)
<p align="center">
   <a href="https://github.com/mauricegift">
    <img src="https://files.catbox.moe/52699c.jpg" width="500">
     
</a>
 <p align="center"><img src="https://profile-counter.glitch.me/{mauricegift}/count.svg" alt="Gifted:: Visitor's Count" /></p>

</details>

## API Endpoints

- `GET /session/:id` - Retrieve session data by short ID (6 characters)
  - Returns: `{ success: true, sessionId: "Darex~abc123", data: "base64_data..." }`
  - Errors: 400 (invalid format), 404 (not found), 500 (server error)

## Environment Variables

When deploying this session generator, you need:
- `MONGODB_URI` - Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/b64`)

[`ℹ️Contact Owner`](https://api.giftedtech.co.ke/contact)
 <br>
<a href='https://github.com/mauricegift/gifted-session/fork' target="_blank">
    <img alt='FORK REPO' src='https://img.shields.io/badge/-FORK REPO-black?style=for-the-badge&logo=github&logoColor=white'/>
</a>

<details>
<summary>DEPLOYMENT</summary>
 
<a href='https://dashboard.heroku.com/new?template=https://github.com/mauricegift/gifted-session' target="_blank"><img alt='HEROKU DEPLOY' src='https://img.shields.io/badge/-HEROKU DEPLOY-black?style=for-the-badge&logo=heroku&logoColor=white'/>
 <br>
<a href='https://dashboard.render.com' target="_blank">
    <img alt='DEPLOY TO RENDER' src='https://img.shields.io/badge/-DEPLOY TO RENDER-black?style=for-the-badge&logo=render&logoColor=white'/>
</a>
 <br>
<a href='https://app.koyeb.com' target="_blank">
    <img alt='DEPLOY TO KOYEB' src='https://img.shields.io/badge/-DEPLOY TO KOYEB-black?style=for-the-badge&logo=koyeb&logoColor=white'/>
</a>

</details>

[`HERE'S AN EXAMPLE OUTPUT`](https://session.giftedtech.co.ke)
# `Owner`

 <a href="https://github.com/mauricegift"><img src="https://github.com/mauricegift.png" width="250" height="250" alt="Gifted Tech"/></a>
