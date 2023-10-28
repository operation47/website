const socket = io();
export { socket };

socket.on("connect", () => {
    console.log("Connected to the server");
    const info = document.getElementsByClassName("disconnected-info")[0];
    if(info.classList.contains("hidden")) {
        info.classList.add("hidden");
    }
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
    const info = document.getElementsByClassName("disconnected-info")[0];
    if(info.classList.contains("hidden")) {
        info.classList.remove("hidden");
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
