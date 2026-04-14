const { createClient } = require("@deepgram/sdk");
require('dotenv').config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

//האם לשים אופציה של בחירת שפה???
const setupDeepgram = (onTranscript) => {
    // פתיחת חיבור Live ל-Deepgram
    const connection = deepgram.listen.live({
        model: "nova-2",      // המודל הכי מהיר ומדויק שלהם
        language: "he",        // עברית (או 'en-US' לפי הצורך)
        smart_format: true,    // מוסיף סימני פיסוק אוטומטית
        interim_results: true, // מקבלים תוצאות תוך כדי דיבור
    });

    connection.on("open", () => {
        console.log("✅ חיבור ל-Deepgram נפתח בהצלחה");
    });

    connection.on("Transcript", (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && data.is_final) {
            // כאן אנחנו מחזירים את הטקסט הסופי למי שקרא לשירות
            onTranscript(transcript);
        }
    });

    connection.on("error", (err) => {
        console.error("❌ שגיאה ב-Deepgram:", err);
    });

    return connection;
};

module.exports = { setupDeepgram };