const { 
    giftedId,
    removeFile,
    generateRandomCode
} = require('../gift');
const { generateUniqueSessionId, storeSession } = require('../db');
const zlib = require('zlib');
const express = require('express');
const fs = require('fs');
const path = require('path');
let router = express.Router();
const pino = require("pino");
const {
    default: giftedConnect,
    useMultiFileAuthState,
    delay,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

const sessionDir = path.join(__dirname, "session");

router.get('/', async (req, res) => {
    const id = giftedId();
    let num = req.query.number;
    let responseSent = false;
    let sessionCleanedUp = false;

    async function cleanUpSession() {
        if (!sessionCleanedUp) {
            try {
                await removeFile(path.join(sessionDir, id));
            } catch (cleanupError) {
                console.error("Cleanup error:", cleanupError);
            }
            sessionCleanedUp = true;
        }
    }

    async function GIFTED_PAIR_CODE() {
    const { version } = await fetchLatestBaileysVersion();
    console.log(version);
        const { state, saveCreds } = await useMultiFileAuthState(path.join(sessionDir, id));
        try {
            let Gifted = giftedConnect({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
                syncFullHistory: false,
                generateHighQualityLinkPreview: true,
                shouldIgnoreJid: jid => !!jid?.endsWith('@g.us'),
                getMessage: async () => undefined,
                markOnlineOnConnect: true,
                connectTimeoutMs: 60000, 
                keepAliveIntervalMs: 30000
            });

            if (!Gifted.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                
                const randomCode = generateRandomCode();
                const code = await Gifted.requestPairingCode(num, randomCode);
                
                if (!responseSent && !res.headersSent) {
                    res.json({ code: code });
                    responseSent = true;
                }
            }

            Gifted.ev.on('creds.update', saveCreds);
            Gifted.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await Gifted.newsletterFollow("0029VagQEmB002T7MWo3Sj1D@newsletter");
                        await Gifted.groupAcceptInvite("G8Ot8cBXO5k22fLMCDVPgb");
                    } catch (error) {
                        console.error("Newsletter/group error:", error);
                    }
                    
                    await delay(8000);
                    
                    let sessionData = null;
                    let attempts = 0;
                    const maxAttempts = 15;
                    
                    while (attempts < maxAttempts && !sessionData) {
                        try {
                            const credsPath = path.join(sessionDir, id, "creds.json");
                            if (fs.existsSync(credsPath)) {
                                const data = fs.readFileSync(credsPath);
                                if (data && data.length > 100) {
                                    sessionData = data;
                                    break;
                                }
                            }
                            await delay(2000);
                            attempts++;
                        } catch (readError) {
                            console.error("Read error:", readError);
                            await delay(2000);
                            attempts++;
                        }
                    }

                    if (!sessionData) {
                        await cleanUpSession();
                        return;
                    }
                    
                    try {
                        let compressedData = zlib.gzipSync(sessionData);
                        let b64data = compressedData.toString('base64');
                        
                        let shortSessionId;
                        let stored = false;
                        let retries = 0;
                        const maxRetries = 3;
                        
                        while (!stored && retries < maxRetries) {
                            try {
                                shortSessionId = await generateUniqueSessionId(6);
                                await storeSession(shortSessionId, b64data);
                                stored = true;
                            } catch (storeError) {
                                if (storeError.message === 'SESSION_ID_DUPLICATE') {
                                    retries++;
                                    console.log(`Duplicate session ID, retrying... (${retries}/${maxRetries})`);
                                } else {
                                    throw storeError;
                                }
                            }
                        }
                        
                        if (!stored) {
                            throw new Error('Failed to store session after maximum retries');
                        }
                        
                        const sessionIdWithPrefix = 'Darex~' + shortSessionId;
                        
                        await delay(5000); 

                        let sessionSent = false;
                        let sendAttempts = 0;
                        const maxSendAttempts = 5;
                        let Sess = null;

                        while (sendAttempts < maxSendAttempts && !sessionSent) {
                            try {
                                Sess = await Gifted.sendMessage(Gifted.user.id, {
                                    text: sessionIdWithPrefix
                                });
                                sessionSent = true;
                            } catch (sendError) {
                                console.error("Send error:", sendError);
                                sendAttempts++;
                                if (sendAttempts < maxSendAttempts) {
                                    await delay(3000);
                                }
                            }
                        }

                        if (!sessionSent) {
                            await cleanUpSession();
                            return;
                        }

                        await delay(3000);

                        const successMessage = `
🎉 *Welcome to SUBZERO-BOT!* 🚀  

✅ *Successfully Configured!*
✔️ Session Created & Secured
✔️ Added to Support Group
✔️ Subscribed to Updates Channel

🔒 *Your Session ID* is ready!  
⚠️ _Keep it private and secure - don't share it with anyone._ 

💡 *What's Next?* 
1️⃣ Explore all the cool features
2️⃣ Deploy
3️⃣ Enjoy seamless automation! 🤖  

🔗 *Support Channel:* 
👉 https://whatsapp.com/channel/0029VagQEmB002T7MWo3Sj1D

⭐ *Follow Us On GitHub:* 
👉 https://github.com/mrfrankofcc/  

🚀 _Thanks for choosing SUBZERO-BOT!_ ✨`;

                        try {
                            await Gifted.sendMessage(Gifted.user.id, {
                                image: { url: "https://files.catbox.moe/sxseo0.jpg" },
                                caption: successMessage
                            }, { quoted: Sess });
                        } catch (messageError) {
                            console.error("Message send error:", messageError);
                        }

                        await delay(2000);
                        await Gifted.ws.close();
                    } catch (sessionError) {
                        console.error("Session processing error:", sessionError);
                    } finally {
                        await cleanUpSession();
                    }
                    
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    console.log("Reconnecting...");
                    await delay(5000);
                    GIFTED_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error("Main error:", err);
            if (!responseSent && !res.headersSent) {
                res.status(500).json({ code: "Service is Currently Unavailable" });
                responseSent = true;
            }
            await cleanUpSession();
        }
    }

    try {
        await GIFTED_PAIR_CODE();
    } catch (finalError) {
        console.error("Final error:", finalError);
        await cleanUpSession();
        if (!responseSent && !res.headersSent) {
            res.status(500).json({ code: "Service Error" });
        }
    }
});

module.exports = router;
