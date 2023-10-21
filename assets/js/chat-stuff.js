import { loadAllChatMessagesNew, loadAllChatMessages } from "./message-handler.js"
import { socket } from "./script.js"

async function main() {
    await loadAllChatMessagesNew();
}
main();

socket.on('viewerCount', (count) => {
    document.getElementById('viewer-count').textContent = getCountText(count);
});

socket.on('newMessage', () => {
    loadAllChatMessagesNew();
});

function getCountText(count) {
    return count == 1 ? count + ' hat grad FOMO' : count + ' haben grad FOMO';
}



