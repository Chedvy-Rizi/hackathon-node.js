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
        endpointing: 500,
        // interim_results: false,
        sentiment: true,
    });

    connection.on("open", () => {
        console.log("✅ חיבור ל-Deepgram נפתח בהצלחה");
    });
    
    connection.on("results", (data) => {
        const transcript = data.channel.alternatives[0].transcript;

        // כאן אנחנו שולפים את הסנטימנט (רגש) ש-Deepgram זיהה
        // הוא מחזיר בדרך כלל: positive, negative, או neutral
        const sentiment = data.channel.alternatives[0].sentiment || "neutral";
        const sentimentScore = data.channel.alternatives[0].sentiment_score || 0;

        if (transcript.trim() !== "" && data.is_final) {
            console.log(`🎤 תמלול: ${transcript} | רגש: ${sentiment} (${sentimentScore})`);

            // אנחנו מעבירים גם את הטקסט וגם את הרגש לפונקציה הבאה
            onTranscript(transcript, sentiment);
        }
    });

    connection.on("error", (err) => {
        console.error("❌ שגיאה ב-Deepgram:", err);
    });

    return connection;
};

module.exports = { setupDeepgram };