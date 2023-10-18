document.body.addEventListener('click',(e) => { 
    const menuCheckbox = document.getElementById('menu-checkbox');
    if (e.target !== menuCheckbox) {
        menuCheckbox.checked = false
    }
}, false);
