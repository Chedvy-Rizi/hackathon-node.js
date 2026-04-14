const { setupDeepgram } = require('../services/deepgramService');
const { generateAudio } = require('../services/googleTTSService');
const aiLogicService = require('../services/aiLogicService');

const handleSocketConnections = (io) => {
    io.on('connection', (socket) => {
        console.log(`👤 נציג חדש התחבר: ${socket.id}`);

        let dgConnection = null;

        // אירוע 1: תחילת סימולציה
        socket.on('start-simulation', async (data) => {
            console.log(`🚀 סימולציה התחילה עבור: ${data.traineeName}`);
            
            dgConnection = setupDeepgram(async (transcript) => {
                try {
                    // 1. שלחי את הטקסט שתומלל לפייתון לקבלת תשובה מה-AI
                    const aiResponse = await aiLogicService.sendToAI(transcript);
                    console.log(`🤖 תשובת ה-AI התקבלה: ${aiResponse.text}`);

                    // 2. המרת הטקסט של ה-AI לאודיו (TTS) בעזרת גוגל
                    console.log(`🔊 מייצר אודיו בעברית...`);
                    const audioBuffer = await generateAudio(aiResponse.text);

                    // 3. שליחת התגובה המלאה ל-React (טקסט + אודיו בינארי + רגש)
                    socket.emit('customer-response', {
                        text: aiResponse.text,
                        audio: audioBuffer, // ה-React יקבל את זה כ-ArrayBuffer
                        emotion: aiResponse.hume_analysis || "neutral"
                    });
                    
                    console.log(`✅ תגובה נשלחה ל-React בהצלחה`);

                } catch (error) {
                    console.error("❌ שגיאה בעיבוד התגובה:", error);
                }
            });
        });

        // אירוע 2: קבלת צ'אנקים של אודיו (נשאר ללא שינוי)
        socket.on('audio-stream', (chunk) => {
            if (dgConnection && dgConnection.getReadyState() === 1) {
                dgConnection.send(chunk);
            }
        });

        // אירוע 3: סיום סימולציה (נשאר ללא שינוי)
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