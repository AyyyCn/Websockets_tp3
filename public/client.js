const socket = io();
let username;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
let id = 0;
do {
    username = prompt('Veuillez entrer votre nom');
} while (!username);

textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        sendMessage(e.target.value);
    }
});

// Update the send button event listener
const sendButton = document.getElementById('sendButton');
sendButton.addEventListener('click', () => {
    sendMessage(textarea.value);
});

function sendMessage(message) {
    let msg = {
        id: id+1,
        user: username,
        message: message.trim()
    };
    id++;
    // Append
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    textarea.style.height = ''; 
    scrollToBottom();

    // Send to server
    socket.emit('message', msg);
}

function appendMessage(wrappedMsg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');
    mainDiv.setAttribute('data-id', wrappedMsg.id);  

    let markup = `
        <h4>${wrappedMsg.user}</h4>
        <p>${wrappedMsg.message}</p>
        <div class="reactions-display"></div>
        <div class="emoji-reactions" style="display: none;">
            <span class="emoji">😀</span>
            <span class="emoji">😂</span>
            <span class="emoji">😍</span>
            <span class="emoji">😢</span>
            <span class="emoji">👍</span>
        </div>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);

    mainDiv.addEventListener('mouseover', () => {
        mainDiv.querySelector('.emoji-reactions').style.display = 'block';
    });
    mainDiv.addEventListener('mouseout', () => {
        mainDiv.querySelector('.emoji-reactions').style.display = 'none';
    });

    const emojis = mainDiv.querySelectorAll('.emoji');
    emojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            const emojiText = emoji.textContent;
            socket.emit('emoji_reaction', { messageId: wrappedMsg.id, emoji: emojiText });
        });
    });

  
}
socket.on('id', (serverID) => {
    console.log('ID received from server');
    console.log(serverID);
    id = serverID;

});
// Receive messages
socket.on('message', (wrappedMsg) => {
    console.log(wrappedMsg);
    id = wrappedMsg.id;
    appendMessage(wrappedMsg, 'incoming');
    scrollToBottom();
});
socket.on('emoji_reaction', (data) => {
    const { messageId, emoji } = data;
    const messageDiv = document.querySelector(`div[data-id="${messageId}"]`);  // Find the message by data-id
    if (messageDiv) {
        const reactionsDisplay = messageDiv.querySelector('.reactions-display');
        reactionsDisplay.textContent += emoji;  // Append the received emoji to the reactions display
    }
});

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Update textarea height dynamically based on content
textarea.addEventListener('input', () => {
    textarea.style.height = ''; 
    textarea.style.height = `${textarea.scrollHeight}px`;
});
