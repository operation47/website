export function createHTMLElement(type, options, classList) {
    const element = document.createElement(type);
    if (options) {
        for (const key in options) {
            if (key === innerHTML) {
                element.innerHTML = options[key];
            } else if (key === textContent) {
                element.textContent = options[key];
            } else {
                element.setAttribute(key, options[key]);
            }
        }
    }
    if (classList) {
        for (const style of classList) {
            element.classList.add(style);
        }
    }
    return element;
}
