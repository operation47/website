import { loadAllChatMessages } from "./message-handler.js"

const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

function getCountText(count) {
    return count == 1 ? count + ' hat grad FOMO' : count + ' haben grad FOMO'
}

socket.on('viewerCount', (count) => {
    document.getElementById('viewer-count').textContent = getCountText(count)
});


document.body.addEventListener('click',(e) => { 
    const menuCheckbox = document.getElementById('menu-checkbox');
    if (e.target !== menuCheckbox) {
        menuCheckbox.checked = false
    }
}, false);


let reloadEnabled = false;
let reloadIntervalHandle = null;
window.toggleReload = function () {
    const reloadButton = document.getElementById("reload-button");

    if (reloadEnabled) {
        reloadEnabled = false;
        console.log("Auto Reload disabled");
        reloadButton.innerHTML = "Auto Reload <b>OFF</b>";
        reloadButton.style.backgroundColor = "#9d2933";
        clearInterval(reloadIntervalHandle);
        return;
    } 
    console.log("Auto Reload enabled");
    reloadEnabled = true;
    reloadButton.innerHTML = "Auto Reload <b>ON</b>";
    reloadButton.style.backgroundColor = "#26C281";
    reloadIntervalHandle = setInterval(() => {
        loadAllChatMessages();
    }, 45000);
}


async function main() {
    await loadAllChatMessages();
}
main();
