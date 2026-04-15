const { createClient } = require("@deepgram/sdk");
require('dotenv').config();

// יצירת הלקוח
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const setupDeepgram = (onTranscript) => {
    // בדיקה ראשונית של המפתח
    if (!process.env.DEEPGRAM_API_KEY) {
        console.error("❌ Deepgram API Key is missing!");
        return null;
    }

    // פתיחת חיבור לפי הסינטקס החדש
    const connection = deepgram.listen.live({
        model: "nova-2", // מומלץ להשתמש ב-nova-2 ליציבות ב-Hebrew, או nova-3 אם זמין
        language: "he",
        smart_format: true,
        interim_results: false, // כדאי להגדיר כדי לקבל רק תוצאות סופיות
        encoding: "linear16",
        sample_rate: 16000
    });

    connection.on("open", () => {
        console.log("✅ חיבור ל-Deepgram נפתח בהצלחה");
    });

    // ב-SDK החדש משתמשים ב-'message' ולא ב-'Transcript'
    connection.on("message", (data) => {
        // המבנה של הנתונים ב-v3
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        
        if (transcript && data.is_final) {
            console.log("📝 תמלול סופי:", transcript);
            onTranscript(transcript);
        }
    });

    connection.on("close", (event) => {
        console.log(`❌ החיבור נסגר! קוד: ${event.code}`);
    });

    connection.on("error", (err) => {
        console.error("❌ שגיאה ב-Deepgram:", err);
    });

    return connection;
};

module.exports = { setupDeepgram };