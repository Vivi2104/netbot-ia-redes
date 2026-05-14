const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Función para agregar mensajes a la pantalla
function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    if (sender === 'bot') {
        marked.setOptions({ breaks: true });
        messageDiv.innerHTML = marked.parse(text);
    } else {
        messageDiv.innerText = text;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Función para enviar el mensaje a nuestra API interna
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';

    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message');
    typingIndicator.innerText = "Pensando...";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Hacemos una petición directa a nuestra Serverless Function de Vercel
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        typingIndicator.remove();

        if (data.text) {
            appendMessage(data.text, 'bot');
        } else {
            appendMessage("Lo siento, ocurrió un error en la comunicación de datos.", 'bot');
        }
    } catch (error) {
        console.error("Error:", error);
        typingIndicator.innerText = "Lo siento, ocurrió un error al conectar con el servidor.";
    }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});