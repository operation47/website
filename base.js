export function createHTMLElement(type, options, classList) {
    const element = document.createElement(type);
    if (options) {
        for (const key in options) {
            element.setAttribute(key, options[key]);
        }
    }
    if (classList) {
        for (const style of classList) {
            element.classList.add(style);
        }
    }
    return element;
}
