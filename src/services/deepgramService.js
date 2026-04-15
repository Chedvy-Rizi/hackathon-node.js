const { createClient } = require("@deepgram/sdk");
require('dotenv').config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

//האם לשים אופציה של בחירת שפה???
const setupDeepgram = (onTranscript) => {
    // פתיחת חיבור Live ל-Deepgram
    const connection = deepgram.listen.live({
        model: "nova-2",
        language: "he",
        smart_format: true,
        interim_results: true,
        encoding: "linear16",
        sample_rate: 16000
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
// 1. האם המפתח בכלל נטען?
console.log("Deepgram Key check:", process.env.DEEPGRAM_API_KEY ? "EXISTS" : "MISSING");

connection.on("close", (event) => {
    // אירוע הסגירה יספר לנו הכל
    console.log(`❌ החיבור נסגר! קוד: ${event.code}, סיבה: ${event.reason}`);
});

connection.on("error", (err) => {
    // הדפסה מפורטת של השגיאה
    console.error("❌ Deepgram Error Detail:", JSON.stringify(err, null, 2));
});
    connection.on("error", (err) => {
        console.error("❌ שגיאה ב-Deepgram:", err);
    });

    return connection;
};

module.exports = { setupDeepgram };