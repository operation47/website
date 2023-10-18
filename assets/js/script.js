const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

document.body.addEventListener('click',(e) => { 
    const menuCheckbox = document.getElementById('menu-checkbox');
    if (e.target !== menuCheckbox) {
        menuCheckbox.checked = false
    }
}, false);
