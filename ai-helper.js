const chatContainer = document.getElementById('ai-chat-container');
const helpButton = document.getElementById('help-button');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

let conversationHistory = [];
let currentExerciseRef;

export function initAIHelper(currentExercise) {
    currentExerciseRef = currentExercise;
    helpButton.addEventListener('click', toggleChat);
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function toggleChat() {
    chatContainer.classList.toggle('visible');
    if (chatContainer.classList.contains('visible')) {
        chatInput.focus();
        if (conversationHistory.length === 0) {
            addMessage("Hello, gladiator! How can I assist you with your training?", 'ai');
        }
    }
}

function addMessage(text, sender) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message', `${sender}-message`);
    messageEl.textContent = text;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    addMessage(messageText, 'user');
    chatInput.value = '';
    
    conversationHistory.push({ role: 'user', content: messageText });
    conversationHistory = conversationHistory.slice(-10);

    addMessage("Thinking...", 'ai');
    
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful and encouraging Roman-era fitness coach for a workout game. The user is a gladiator in training. The current exercise is "${currentExerciseRef?.name}". Be concise and mobile-friendly. You can give tips on form, encouragement, or answer general fitness questions in character.`
                },
                ...conversationHistory
            ],
        });
        const response = completion.content;
        
        chatMessages.removeChild(chatMessages.lastChild); // Remove "Thinking..."
        addMessage(response, 'ai');
        conversationHistory.push(completion);

        const tts = await websim.textToSpeech({ text: response, voice: "en-male" });
        const audio = new Audio(tts.url);
        audio.play();

    } catch (error) {
        console.error("AI chat error:", error);
        chatMessages.removeChild(chatMessages.lastChild);
        addMessage("Sorry, I am unable to respond right now.", 'ai');
    }
}

