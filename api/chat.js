const { GoogleGenAI } = require("@google/genai");

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "La API Key no está configurada en Vercel." });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: `Eres NetBot, un tutor experto en Redes de Computadoras y Telecomunicaciones para estudiantes de Ingeniería en Sistemas Computacionales. 
                Tu objetivo es responder de forma clara, técnica pero educativa. 
                Dominas los siguientes temas: Modelo OSI, TCP/IP, direccionamiento IPv4/IPv6, subneteo, protocolos de enrutamiento (OSPF, BGP, RIP), conmutación (VLANs, STP), seguridad en redes y comandos de configuración Cisco CLI.
                Si el usuario te pregunta algo completamente fuera del área de redes o informática, redirígelo amablemente diciendo que solo estás programado para resolver dudas de redes.`
            }
        });

        // Enviamos la propiedad "text" limpia para que app.js la lea directo
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ error: "Error al procesar la solicitud con Gemini" });
    }
};