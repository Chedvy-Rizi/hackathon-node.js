// // const { createClient } = require("@deepgram/sdk");
// // require('dotenv').config();

// // const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// // //האם לשים אופציה של בחירת שפה???
// // const setupDeepgram = (onTranscript) => {
// //     // פתיחת חיבור Live ל-Deepgram
// //     const connection = deepgram.listen.live({
// //         model: "nova-2",      // המודל הכי מהיר ומדויק שלהם
// //         language: "he",        // עברית (או 'en-US' לפי הצורך)
// //         smart_format: true,    // מוסיף סימני פיסוק אוטומטית
// //         interim_results: true, // מקבלים תוצאות תוך כדי דיבור
// //         endpointing: 500,
// //         // interim_results: false,
// //         sentiment: true,
// //     });

// //     connection.on("open", () => {
// //         console.log("✅ חיבור ל-Deepgram נפתח בהצלחה");
// //     });
    
// //     connection.on("results", (data) => {
// //         const transcript = data.channel.alternatives[0].transcript;

// //         // כאן אנחנו שולפים את הסנטימנט (רגש) ש-Deepgram זיהה
// //         // הוא מחזיר בדרך כלל: positive, negative, או neutral
// //         const sentiment = data.channel.alternatives[0].sentiment || "neutral";
// //         const sentimentScore = data.channel.alternatives[0].sentiment_score || 0;

// //         if (transcript.trim() !== "" && data.is_final) {
// //             console.log(`🎤 תמלול: ${transcript} | רגש: ${sentiment} (${sentimentScore})`);

// //             // אנחנו מעבירים גם את הטקסט וגם את הרגש לפונקציה הבאה
// //             onTranscript(transcript, sentiment);
// //         }
// //     });

// //     connection.on("error", (err) => {
// //         console.error("❌ שגיאה ב-Deepgram:", err);
// //     });

// //     return connection;
// // };

// // module.exports = { setupDeepgram };


// const { createClient } = require("@deepgram/sdk");
// require('dotenv').config();
// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// const setupDeepgram = (onTranscript) => {
//     const connection = deepgram.listen.live({
//         model: "nova-2",
//         language: "he",
//         smart_format: true,
//         endpointing: 500,
//         interim_results: false
//         // הסרנו את sentiment: true כי הוא גורם לשגיאה בעברית
//     });

//     connection.on("open", () => {
//         console.log("✅ חיבור ל-Deepgram נפתח בהצלחה");
//     });
    
//     connection.on("results", (data) => {
//         const transcript = data.channel.alternatives[0].transcript;

//         if (transcript.trim() !== "" && data.is_final) {
//             console.log(`🎤 תמלול סופי: ${transcript}`);
//             // מעבירים "neutral" כברירת מחדל כי הסרנו את הניתוח האוטומטי
//             onTranscript(transcript, "neutral");
//         }
//     });

//     connection.on("error", (err) => {
//         console.error("❌ שגיאה ב-Deepgram:", err);
//     });

//     return connection;
// };

// module.exports = { setupDeepgram };



const { createClient } = require("@deepgram/sdk");
require('dotenv').config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const setupDeepgram = (onTranscript) => {
    // הגדרות בסיסיות שעובדות בוודאות בעברית
    const connection = deepgram.listen.live({
        model: "nova-2",
        language: "he",
        smart_format: true,
        endpointing: 500, // מזהה את השתיקה שלך
        interim_results: false // מקבלים רק את המשפט הסופי
    });

    connection.on("open", () => {
        console.log("✅ חיבור ל-Deepgram נפתח בהצלחה - המערכת מאזינה");
    });

    connection.on("results", (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        // בדיקה שהמשפט סופי (בגלל השקט) ושיש בו תוכן
        if (data.is_final && transcript.trim() !== "") {
            console.log(`🎤 תמלול סופי זוהה: ${transcript}`);
            // מעבירים "neutral" כברירת מחדל במקום ה-Sentiment שהסרנו
            onTranscript(transcript, "neutral");
        }
    });

    connection.on("error", (err) => {
        console.error("❌ שגיאה ב-Deepgram:", err);
    });

    return connection;
};

module.exports = { setupDeepgram };