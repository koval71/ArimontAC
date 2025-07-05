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
        // Include inventory context with the message
        const inventoryContext = getInventoryContext();
        const messageWithContext = `You are KovalBot, a helpful and friendly home inventory assistant. 

${inventoryContext}

Instructions for responses:
- Answer naturally and conversationally in the same language the user asks
- Be concise and direct
- Don't use "Respuesta para el usuario" or numbered lists
- Don't say "unidad" or "unidades", just use the numbers directly
- For quantities, respond like: "Te quedan 2 de queso, 1 de mantequilla y 5 de banana"
- Be helpful and friendly but keep answers short

User question: ${userMessage}`;
        
        const res = await fetch('https://kovalbot-backend.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageWithContext })
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
window.toggleChatbot = toggleChatbot;

function toggleChatbot() {
    const chatbotBody = document.getElementById('chatbot-body');
    const chatbotHeader = document.getElementById('chatbot-header');
    
    if (chatbotBody.style.display === 'none') {
        chatbotBody.style.display = 'block';
        chatbotHeader.style.borderRadius = '10px 10px 0 0';
    } else {
        chatbotBody.style.display = 'none';
        chatbotHeader.style.borderRadius = '10px';
    }
}

function getInventoryContext() {
    // Get current inventory items from localStorage
    const items = JSON.parse(localStorage.getItem('homeInventory') || '[]');
    
    // Debug log to see what's in localStorage
    console.log('Inventory items from localStorage:', items);
    
    if (items.length === 0) {
        return "The inventory is currently empty.";
    }
    
    let context = "Current Home Inventory:\n";
    items.forEach((item, index) => {
        context += `${index + 1}. ${item.name} - Quantity: ${item.qty}\n`;
    });
    
    // Add total count
    const totalItems = items.reduce((total, item) => total + item.qty, 0);
    context += `\nTotal items in inventory: ${totalItems}`;
    
    console.log('Inventory context being sent:', context);
    return context;
}
