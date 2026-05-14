module.exports = async function handler(req, res) {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // Este ajuste revisa con más cuidado dónde está el texto
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ text: botReply });
        } else {
            // Si la estructura es rara, imprimimos el error para verlo en Vercel
            console.error("Estructura inesperada de Gemini:", JSON.stringify(data));
            return res.status(200).json({ text: "La IA respondió, pero el formato fue inesperado. Intenta preguntar de nuevo." });
        }

    } catch (error) {
        console.error("Error en el bot:", error);
        return res.status(500).json({ error: "Error al procesar la respuesta" });
    }
};