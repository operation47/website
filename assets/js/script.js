import { loadAllChatMessages } from "./message-handler.js"

async function main() {
    await loadAllChatMessages();
}
main();

const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

socket.on('viewerCount', (count) => {
    document.getElementById('viewer-count').textContent = getCountText(count)
});

socket.on('newMessage', () => {
    loadAllChatMessages();
});

function getCountText(count) {
    return count == 1 ? count + ' hat grad FOMO' : count + ' haben grad FOMO'
}

document.body.addEventListener('click',(e) => { 
    const menuCheckbox = document.getElementById('menu-checkbox');
    if (e.target !== menuCheckbox) {
        menuCheckbox.checked = false
    }
}, false);
