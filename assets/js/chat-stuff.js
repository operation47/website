import { loadAllChatMessages, loadChatMessagesForChannel } from "./message-handler.js";
import { socket } from "./script.js";

async function main() {
    await loadAllChatMessages();
}
main();

socket.on("viewerCount", (count) => {
    document.getElementById("viewer-count").textContent = getCountText(count);
});

socket.on("newMessage", (channel) => {
    loadChatMessagesForChannel(channel.substring(1));
});

function getCountText(count) {
    return count == 1 ? count + " hat grad FOMO" : count + " haben grad FOMO";
}

const disconnect_info = document.getElementsByClassName("disconnected-info")[0];
const dots = document.getElementsByClassName("dots")[0];
let dotInterval;
let dotIndex = 0;

function cycleDots() {
    dotIndex = (dotIndex + 1) % 4;
    dots.innerHTML = ".".repeat(dotIndex);
}

socket.on("connect", () => {
    if(!disconnect_info.classList.contains("hidden")) {
        if(dotInterval) {
            clearInterval(dotInterval);
        }
        disconnect_info.classList.add("green");
        setTimeout(() => {
            disconnect_info.classList.add("hidden");
        }, 250);
    }
});

socket.on("disconnect", () => {
    if(disconnect_info.classList.contains("hidden")) {
        disconnect_info.classList.remove("hidden");
        disconnect_info.classList.remove("green");
        dotInterval = setInterval(cycleDots, 500);
    }
});

window.addEventListener('pageshow', () => {
    if (!socket.connected) {
        socket.connect();
    }
});

setTimeout(() => {
    if(!disconnect_info) return;
    disconnect_info.classList.remove("prevent-animation");
}, 250);

setInterval(() => {
    if(!socket.connected) {
        socket.connect();
    }
}, 5000);

