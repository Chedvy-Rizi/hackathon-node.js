const { HumeClient } = require('hume');

const client = new HumeClient({
    apiKey: process.env.HUME_API_KEY,
});

const analyzeEmotion = async (text) => {
    try {
        // קריאה ל-Hume
        const response = await client.expressionMeasurement.batch.startInferenceJob({
            models: { language: {} },
            payload: { text: [text] }
        });
        return response;
    } catch (error) {
        console.warn("⚠️ Hume Service Error - Returning Mock Data");
        return { calm: 0.9, stress: 0.1 }; // ה-Mock שלך למקרה של חסימה
    }
};

module.exports = { analyzeEmotion };