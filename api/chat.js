module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // URL actualizada a v1 y usando el modelo correcto gemini-2.5-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // Extraemos la respuesta de manera segura
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ text: botReply });
        } 
        
        if (data.error) {
            return res.status(200).json({ text: `Error de Google: ${data.error.message}` });
        }

        return res.status(200).json({ text: "La IA respondió, pero el formato fue inesperado." });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Error interno al procesar" });
    }
};