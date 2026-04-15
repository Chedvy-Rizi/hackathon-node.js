const { createClient } = require("@deepgram/sdk");
require('dotenv').config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

//האם לשים אופציה של בחירת שפה???
const setupDeepgram = (onTranscript) => {
    // פתיחת חיבור Live ל-Deepgram
    const connection = deepgram.listen.live({
    model: "nova-3",
    language: "he",
    smart_format: true,
    // הוספת הכתובת המאובטחת במידה והענן חוסם את ברירת המחדל
    url: "wss://api.deepgram.com/v1/listen",
    encoding: "linear16", // או 'webm-opus' אם זה מה שהדפדפן שולח
    sample_rate: 16000
});

    connection.on("open", () => {
        console.log("✅ חיבור ל-Deepgram נפתח בהצלחה");
    });

    connection.on("results", (data) => {
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