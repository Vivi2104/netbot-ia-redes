module.exports = async function handler(req, res) {
    try {
        const { message } = req.body;
        
        // Aquí solo la lógica de Gemini
        const botReply = await llamarAGemini(message); 

        // Enviamos la respuesta sin intentar guardar nada en BD
        return res.status(200).json({ text: botReply });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Error al procesar" });
    }
};