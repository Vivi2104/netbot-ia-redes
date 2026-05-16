module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Obtenemos message y mode desde el body estructurado
        const { message, mode } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Configuración de instrucciones del sistema según la personalidad elegida
        let systemInstruction = "";
        if (mode === "cisco") {
            systemInstruction = "Actúa como una terminal de Cisco IOS y un ingeniero CCNA rudo y directo. Enfócate estrictamente en comandos exactos de Router/Switch (como configure terminal, interface, etc.), sintaxis de redes, configuraciones de interfaces y troubleshooting técnico de networking. Usa bloques de código para estructurar los comandos.";
        } else if (mode === "admin") {
            systemInstruction = "Actúa como un Administrador de Redes Senior empresarial. Da soluciones rápidas de nivel de producción para resolver caídas de red, problemas de enrutamiento y configuraciones reales de infraestructura. Evita rodeos teóricos extensos.";
        } else {
            // Modo Profesor por defecto
            systemInstruction = "Actúa como un excelente y paciente profesor universitario de Ingeniería en Sistemas del Tecnológico de Cancún. Explica los conceptos de redes y telecomunicaciones de manera didáctica, usando analogías sencillas ('con peras y manzanas'), estructuras organizadas y tablas comparativas paso a paso, ideal para repasar antes de un examen.";
        }

        // Combinamos la instrucción secreta con el prompt enviado por el alumno
        const promptCompleto = `${systemInstruction}\n\nPregunta del estudiante: ${message}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptCompleto }] }]
            })
        });

        const data = await response.json();

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