import { loadAllChatMessages } from "./message-handler.js"

await loadAllChatMessages();

const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});
socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

socket.on('viewerCount', (count) => {
    document.getElementById('viewer-count').textContent = getViewerCountText(count);
});
socket.on('newMessage', () => {
    loadAllChatMessages();
});

function getViewerCountText(count) {
    return count == 1 ? count + ' hat grad FOMO' : count + ' haben grad FOMO'
}

document.body.addEventListener('click', (e) => {
    const menuCheckbox = document.getElementById('menu-checkbox');
    if (e.target !== menuCheckbox) {
        menuCheckbox.checked = false
    }
}, false);
