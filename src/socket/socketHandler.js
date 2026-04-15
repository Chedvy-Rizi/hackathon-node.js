// const { setupDeepgram } = require('../services/deepgramService');
// const { generateAudio } = require('../services/googleTTSService');
// const aiLogicService = require('../services/aiLogicService');

// const handleSocketConnections = (io) => {
//     io.on('connection', (socket) => {
//         console.log(`👤 נציג חדש התחבר: ${socket.id}`);

//         let dgConnection = null;

//         // אירוע 1: תחילת סימולציה
//         socket.on('start-simulation', async (data) => {
//             console.log(`🚀 סימולציה התחילה עבור: ${data.traineeName}`);
            
//             dgConnection = setupDeepgram(async (transcript) => {
//                 try {
//                     // 1. שלחי את הטקסט שתומלל לפייתון לקבלת תשובה מה-AI
//                     const aiResponse = await aiLogicService.sendToAI(transcript);
//                     console.log(`🤖 תשובת ה-AI התקבלה: ${aiResponse.text}`);

//                     // 2. המרת הטקסט של ה-AI לאודיו (TTS) בעזרת גוגל
//                     console.log(`🔊 מייצר אודיו בעברית...`);
//                     const audioBuffer = await generateAudio(aiResponse.text);

//                     // 3. שליחת התגובה המלאה ל-React (טקסט + אודיו בינארי + רגש)
//                     socket.emit('customer-response', {
//                         text: aiResponse.text,
//                         audio: audioBuffer, // ה-React יקבל את זה כ-ArrayBuffer
//                         emotion: aiResponse.hume_analysis || "neutral"
//                     });
                    
//                     console.log(`✅ תגובה נשלחה ל-React בהצלחה`);

//                 } catch (error) {
//                     console.error("❌ שגיאה בעיבוד התגובה:", error);
//                 }
//             });
//         });

//         // אירוע 2: קבלת צ'אנקים של אודיו (נשאר ללא שינוי)
//         socket.on('audio-stream', (chunk) => {
//             if (dgConnection && dgConnection.getReadyState() === 1) {
//                 dgConnection.send(chunk);
//             }
//         });

//         // אירוע 3: סיום סימולציה (נשאר ללא שינוי)
//         socket.on('stop-simulation', () => {
//             console.log('⏹️ הנציג סיים את השיחה');
//             if (dgConnection) {
//                 dgConnection.finish();
//                 dgConnection = null;
//             }
//         });

//         socket.on('disconnect', () => {
//             console.log(`❌ נציג התנתק: ${socket.id}`);
//             if (dgConnection) {
//                 dgConnection.finish();
//             }
//         });
//     });
// };

// module.exports = handleSocketConnections;




const { setupDeepgram } = require('../services/deepgramService');
const googleTTSService = require('../services/googleTTSService'); // וודאי שהשם תואם לייבוא
const aiLogicService = require('../services/aiLogicService');

const handleSocketConnections = (io) => {
    io.on('connection', (socket) => {
        console.log(`👤 נציג חדש התחבר: ${socket.id}`);

        // משתנה שיחזיק את החיבור לכל אורך חיי הסוקט
        let dgConnection = null;

        socket.on('start-simulation', async (data) => {
            console.log(`🚀 סימולציה התחילה עבור: ${data?.traineeName || 'אנונימי'}`);

            // שים לב: בלי const כאן, כדי להשתמש במשתנה שהגדרנו למעלה
            dgConnection = setupDeepgram(async (transcript, sentiment) => {
                console.log(`🎤 Deepgram זיהה סוף משפט: "${transcript}"`);
                
                // שליחת עדכון לריאקט שהתמלול הצליח
                socket.emit('chat-update', { role: 'agent', text: transcript });

                // --- כאן מתחיל הדימוי של ה-8 שניות שביקשת ---
                console.log("⏳ מחכה 8 שניות (הדמיה של עיבוד AI/פייתון)...");
                socket.emit('ai-thinking', true); // עדכון לריאקט שה-AI חושב

                setTimeout(async () => {
                    try {
                        console.log("✅ 8 שניות עברו, מייצר תגובה...");
                        
                        // כאן את יכולה להחליט: או לפנות ל-AI האמיתי או לשים טקסט דמה
                        // ננסה לפנות לאמיתי, ואם הוא נכשל נחזיר דמה
                        let aiResponseText;
                        try {
                            aiResponseText = await aiLogicService.sendToAI(transcript, sentiment);
                        } catch (e) {
                            aiResponseText = "הבנתי אותך, אני בודק את זה במערכת.";
                        }

                        // המרה לקול
                        // const audioBuffer = await googleTTSService.synthesize(aiResponseText);
                        const audioBuffer = await googleTTSService.generateAudio(aiResponseText);

                        // שליחה לריאקט
                        socket.emit('ai-thinking', false);
                        socket.emit('customer-response', {
                            audio: audioBuffer,
                            text: aiResponseText,
                            agentSentiment: sentiment
                        });

                        console.log("🔈 תגובה נשלחה. המערכת מחכה למשפט הבא שלך (אוטומטי)!");

                    } catch (error) {
                        console.error("❌ שגיאה בלופ התגובה:", error);
                        socket.emit('ai-thinking', false);
                    }
                }, 8000); // 8 שניות המתנה
            });
        });

        // קבלת האודיו מהריאקט ושליחתו ל-Deepgram
        socket.on('audio-stream', (chunk) => {
            if (dgConnection && dgConnection.getReadyState() === 1) { // 1 = OPEN
                dgConnection.send(chunk);
            }
        });

        socket.on('stop-simulation', () => {
            console.log('⏹️ הנציג סיים את השיחה');
            if (dgConnection) {
                dgConnection.finish();
                dgConnection = null;
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ נציג התנתק: ${socket.id}`);
            if (dgConnection) {
                dgConnection.finish();
            }
        });
    });
};

module.exports = handleSocketConnections;