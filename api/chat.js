module.exports = async function handler(req, res) {
    // Asegurar que solo acepte peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Llamada directa usando la URL estable de la API de Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // Imprimir en los logs de Vercel para ver qué responde exactamente Google si falla
        console.log("Respuesta cruda de Gemini:", JSON.stringify(data));

        // Validamos la estructura estándar paso a paso de forma ultra segura
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ text: botReply });
        } 
        
        // Si el formato cambia un poco pero trae un mensaje de error interno de Google
        if (data.error) {
            return res.status(200).json({ text: `Error de la API de Google: ${data.error.message}` });
        }

        // Si de plano no entró en ninguna estructura conocida
        return res.status(200).json({ text: "La IA respondió, pero la estructura no coincide. Intenta de nuevo." });

    } catch (error) {
        console.error("Error crítico en el manejador:", error);
        return res.status(500).json({ error: "Error interno al procesar la respuesta" });
    }
};