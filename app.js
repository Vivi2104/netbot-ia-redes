const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Variable global para almacenar el modo activo (por defecto: profesor)
let currentMode = "profesor";

// === PUNTO 1: CONTROL DE CAMBIO DE MODOS ===
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.getAttribute('data-mode');
    });
});

// === PUNTO 2: LÓGICA DE SUGERENCIAS RÁPIDAS ===
document.querySelectorAll('.suggest-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        userInput.value = e.target.innerText;
        handleSend(); // Ejecuta tu función existente de enviar
    });
});

// === PUNTO 3: BOTÓN DE COPIAR CÓDIGO / TABLAS ===
function addCopyButtons(container) {
    // Busca bloques de código y tablas dentro de la burbuja que se acaba de crear
    container.querySelectorAll('pre, table').forEach(block => {
        if (block.querySelector('.copy-code-btn')) return;

        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.innerText = 'Copiar';

        button.addEventListener('click', () => {
            const textToCopy = block.innerText.replace('Copiar', '').trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerText = '¡Copiado!';
                setTimeout(() => button.innerText = 'Copiar', 2000);
            });
        });

        block.style.position = 'relative';
        block.appendChild(button);
    });
}

// Función para agregar mensajes a la pantalla
// Función para agregar mensajes a la pantalla (CORREGIDA PARA TABLAS)
function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    if (sender === 'bot') {
        // CONFIGURACIÓN FORZADA PARA QUE INTERPRETE LAS TABLAS (| columna |)
        marked.setOptions({ 
            breaks: true,
            gfm: true, // Activa GitHub Flavored Markdown (Tablas)
            pedantic: false
        });
        
        // Convertimos el Markdown a HTML real
        messageDiv.innerHTML = marked.parse(text);
        
        // LE INYECTAMOS LA LÓGICA DE COPIAR SOLO A LOS MENSAJES DEL BOT
        messageDiv.classList.add('message-content');
        addCopyButtons(messageDiv);
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

    // ====== INDICADOR DE ESCRITURA ANIMADO ======
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: text,
                mode: currentMode 
            })
        });

        const data = await response.json();
        typingIndicator.remove(); // Quitamos los puntitos antes de mostrar la respuesta

        if (data && data.text) {
            appendMessage(data.text, 'bot');
        } else {
            appendMessage("Lo siento, la IA no devolvió un formato de texto válido.", 'bot');
        }
    } catch (error) {
        console.error("Error:", error);
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }
        appendMessage("Lo siento, ocurrió un error al conectar con el servidor.", 'bot');
    }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});