// Usamos fetch nativo de Node.js (Vercel ya lo incluye por defecto)
module.exports = async function handler(req, res) {
    // Manejar solo peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Si por alguna razón la API Key no está cargada, avisamos de inmediato
        if (!apiKey) {
            return res.status(500).json({ error: "La API Key no está configurada en Vercel." });
        }

        // Endpoint oficial de la API de Gemini (v1beta) usando gemini-2.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Petición HTTP directa
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                systemInstruction: {
                    parts: [{
                        text: `Eres NetBot, un tutor experto en Redes de Computadoras y Telecomunicaciones para estudiantes de Ingeniería en Sistemas Computacionales. 
                        Tu objetivo es responder de forma clara, técnica pero educativa. 
                        Dominas los siguientes temas: Modelo OSI, TCP/IP, direccionamiento IPv4/IPv6, subneteo, protocolos de enrutamiento (OSPF, BGP, RIP), conmutación (VLANs, STP), seguridad en redes y comandos de configuración Cisco CLI.
                        Si el usuario te pregunta algo completamente fuera del área de redes o informática, redirígelo amablemente diciendo que solo estás programado para resolver dudas de redes.`
                    }]
                }
            })
        });

        const data = await response.json();

        // Estructura de extracción segura para las respuestas de Gemini
        if (data.candidates && data.candidates[0] && data.candidates[0].content.parts[0]) {
            const botText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ text: botText });
        } else {
            console.error("Error en formato de Google:", data);
            return res.status(500).json({ error: "No se recibió texto de la IA." });
        }

    } catch (error) {
        console.error("Error crítico en backend:", error);
        return res.status(500).json({ error: "Error interno al procesar la petición." });
    }
};