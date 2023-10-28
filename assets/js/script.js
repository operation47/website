const socket = io();
export { socket };

socket.on("connect", () => {
    console.log("Connected to the server");
    const info = document.getElementsByClassName("disconnected-info")[0];
    if(!info.classList.contains("hidden")) {
        info.classList.add("hidden");
        if(dotInterval) {
            clearInterval(dotInterval);
        }
    }
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
    const info = document.getElementsByClassName("disconnected-info")[0];
    if(info.classList.contains("hidden")) {
        info.classList.remove("hidden");
        dotInterval = setInterval(cycleDots, 500);
    }
});

window.addEventListener('pageshow', () => {
    if (!socket.connected) {
        socket.connect();
    }
});

setInterval(() => {
    if(!socket.connected) {
        socket.connect();
    }
}, 5000);

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        socket.disconnect();
    }
});

document.body.addEventListener(
    "click",
    (e) => {
        const menuCheckbox = document.getElementById("menu-checkbox");
        if (e.target !== menuCheckbox) {
            menuCheckbox.checked = false;
        }
    },
    false,
);


const dots = document.getElementsByClassName("dots")[0];
let dotInterval;
let dotIndex = 0;
function cycleDots() {
    dotIndex = (dotIndex + 1) % 4;
    dots.innerHTML = ".".repeat(dotIndex);
}

const disconnect_info = document.getElementsByClassName("disconnected-info")[0];
setTimeout(() => {
    disconnect_info.classList.remove("prevent-animation");
}, 250);
