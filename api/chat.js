export default async function handler(req, res) {
    // Manejar solo peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // URL Oficial de la API de Gemini para procesamiento de texto
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Petición directa usando fetch nativo
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

        // Extraer la respuesta de la estructura de la API de Google
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
        } else {
            console.error("Respuesta inesperada de Google:", data);
            return res.status(500).json({ error: "Estructura de respuesta inválida" });
        }

    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ error: "Error al procesar la solicitud con Gemini" });
    }
}