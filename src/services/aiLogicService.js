const axios = require('axios');
const { analyzeEmotion } = require('./humeService'); // ייבוא השירות החדש
require('dotenv').config();

const PYTHON_API_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:8000/process';

const sendToAI = async (transcript) => {
    try {
        // 1. קריאה לשירות Hume לקבלת ניתוח רגשות
        const humeMetrics = await analyzeEmotion(transcript);

        // 2. בניית האובייקט המשולב (שני השדות שביקשת)
        const payload = {
            transcript: transcript,   // שדה 1: הטקסט המתומלל
            hume_metrics: humeMetrics // שדה 2: הנתונים המספריים מ-Hume
        };

        console.log("📤 שולח לפייתון אובייקט משולב...");

        // 3. שליחה לשרת הפייתון
        const response = await axios.post(PYTHON_API_URL, payload);

        // מחזירים את התשובה מהפייתון (למשל: { text: "שלום", emotion: "happy" })
        return response.data;

    } catch (error) {
        console.error("❌ שגיאה ב-AI Logic Service:", error.message);
        return { 
            text: "סליחה, המערכת שלי זקוקה לרגע למחשבה.", 
            emotion: "neutral" 
        };
    }
};

module.exports = { sendToAI };