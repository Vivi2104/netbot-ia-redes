import { GoogleGenAI } from "https://esm.run/@google/genai";

// 1. Configura tu API Key de Gemini
const API_KEY = ""; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 2. Elementos del DOM
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 3. Inicializar el chat con rol del sistema estructurado para Redes
let chat;
try {
    chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            // Aquí le damos su personalidad y restricciones al bot
            systemInstruction: `Eres NetBot, un tutor experto en Redes de Computadoras y Telecomunicaciones para estudiantes de Ingeniería en Sistemas Computacionales. 
            Tu objetivo es responder de forma clara, técnica pero educativa. 
            Dominas los siguientes temas: Modelo OSI, TCP/IP, direccionamiento IPv4/IPv6, subneteo, protocolos de enrutamiento (OSPF, BGP, RIP), conmutación (VLANs, STP), seguridad en redes y comandos de configuración Cisco CLI.
            Si el usuario te pregunta algo completamente fuera del área de redes o informática, redirígelo amablemente diciendo que solo estás programado para resolver dudas de redes.`
        }
    });
} catch (error) {
    console.error("Error al inicializar el chat con Gemini:", error);
}

// 4. Función para agregar mensajes a la pantalla
function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    // SI EL MENSAJE ES DEL BOT: Usamos marked.parse() para procesar negritas, listas y código
    if (sender === 'bot') {
        // Aseguramos que los saltos de línea se respeten correctamente
        marked.setOptions({ breaks: true });
        messageDiv.innerHTML = marked.parse(text);
    } else {
        // Si es el usuario, lo dejamos como texto plano por seguridad
        messageDiv.innerText = text;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll al fondo
}

// 5. Función para enviar el mensaje a Gemini
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    // Mostrar mensaje del usuario
    appendMessage(text, 'user');
    userInput.value = '';

    // Mostrar un mensaje temporal de "pensando..."
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message');
    typingIndicator.innerText = "Pensando...";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Enviar historial y mensaje actual a la API
        const response = await chat.sendMessage({ message: text });
        
        // Quitar indicador de pensando y poner la respuesta real
        typingIndicator.remove();
        appendMessage(response.text, 'bot');
    } catch (error) {
        console.error("Error al obtener respuesta de Gemini:", error);
        typingIndicator.innerText = "Lo siento, ocurrió un error al conectar con el servidor.";
    }
}

// 6. Eventos
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});