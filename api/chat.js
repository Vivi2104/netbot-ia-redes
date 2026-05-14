import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // Manejar solo peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { message } = req.body;
        
        // Obtiene la API Key directamente del entorno seguro de Vercel
        const apiKey = process.env.GEMINI_API_KEY;
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

        // Responder con el texto generado
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ error: "Error al procesar la solicitud con Gemini" });
    }
}