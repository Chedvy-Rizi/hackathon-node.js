const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient();

const generateAudio = async (text) => {
    try {
        const request = {
            input: { text: text },
            voice: { 
                languageCode: 'he-IL', 
                name: 'he-IL-Wavenet-A', 
                ssmlGender: 'FEMALE' 
            },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        return response.audioContent; 
    } catch (error) {
        console.error("❌ שגיאה ב-Google TTS Service:", error);
        return null;
    }
};

module.exports = { generateAudio };