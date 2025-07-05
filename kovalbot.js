// kovalbot.js for Home inventory.html
async function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    const messages = document.getElementById('chatbot-messages');
    const userMessage = input.value.trim();
    if (!userMessage) return;
    messages.innerHTML += `<div><b>You:</b> ${userMessage}</div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    try {
        const res = await fetch('https://kovalbot-backend.enrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        const data = await res.json();
        messages.innerHTML += `<div><b>KovalBot:</b> ${data.reply}</div>`;
        messages.scrollTop = messages.scrollHeight;
    } catch (err) {
        messages.innerHTML += `<div style="color:red;"><b>Error:</b> Could not reach chatbot server.</div>`;
        messages.scrollTop = messages.scrollHeight;
    }
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chatbot-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendChatbotMessage();
    });
});
window.sendChatbotMessage = sendChatbotMessage;
