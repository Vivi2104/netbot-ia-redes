const { GoogleGenAI } = require("@google/genai");

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        
        // Inicializa con la variable exacta de Vercel
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Llamada usando el modelo correcto mediante el SDK
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
        });

        // El SDK extrae el texto de forma directa y segura
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("Error completo en Vercel:", error);
        return res.status(500).json({ error: "Error al procesar la respuesta de la IA" });
    }
};