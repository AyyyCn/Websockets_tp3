const socket = io();
let username;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
const pingSound = document.getElementById('pingSound');
let id = 0;
do {
    username = prompt('Please enter your name: ');
} while (!username);

textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Modify to send on Enter key press only (without Shift key)
        e.preventDefault(); // Prevents the newline character from being inserted
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
    // Append
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    textarea.style.height = ''; // Reset the textarea height
    scrollToBottom();

    // Send to server
    socket.emit('message', msg);
}

function appendMessage(wrappedMsg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    console.log(wrappedMsg);
    mainDiv.classList.add(className, 'message');
    mainDiv.setAttribute('data-id', wrappedMsg.id);  // Set data-id attribute for unique identification

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
            //mainDiv.querySelector('.reactions-display').textContent += emojiText;  // Update the reactions display
            socket.emit('emoji_reaction', { messageId: wrappedMsg.id, emoji: emojiText });  // Emit the reaction to the server
        });
    });

    if (type === 'incoming') {
        //pingSound.play();
    }
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
    textarea.style.height = ''; // Reset the textarea height
    textarea.style.height = `${textarea.scrollHeight}px`;
});
