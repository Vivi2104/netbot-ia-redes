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

        // 1. Inicializamos Gemini y obtenemos la respuesta
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: `Eres NetBot, un tutor experto en Redes de Computadoras y Telecomunicaciones para estudiantes de Ingeniería en Sistemas Computacionales. 
                Tu objetivo es responder de forma clara, técnica pero educativa. 
                Dominas los siguientes temas: Modelo OSI, TCP/IP, direccionamiento IPv4/IPv6, subneteo, protocolos de enrutamiento (OSPF, BGP, RIP), conmutación (VLANs, STP), seguridad en redes y comandos de configuración Cisco CLI.`
            }
        });

        const botReply = result.text;

        // 2. GUARDAR EN SUPABASE (El nuevo motor de historial)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        // Solo intentamos guardar si configuraste bien las variables en Vercel
        if (supabaseUrl && supabaseKey) {
            try {
                await fetch(`${supabaseUrl}/rest/v1/historial_mensajes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        usuario_input: message,
                        bot_respuesta: botReply
                    })
                });
                console.log("✅ Mensaje guardado en el historial.");
            } catch (dbError) {
                console.error("❌ Error al guardar en Supabase:", dbError);
                // No bloqueamos la respuesta al usuario aunque falle la base de datos
            }
        }

        // 3. Enviamos la respuesta al Chat (Frontend)
        return res.status(200).json({ text: botReply });

    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ error: "Error al procesar la solicitud con Gemini" });
    }
};   