import { createHTMLElement } from "./base.js";
import { parseMessage, loadEmotes } from "./message-parser.js";

let emotesLoaded = false
export async function loadAllChatMessages() {
    loadMessagesForChannel("di1araas")
    loadMessagesForChannel("stegi")
}

export async function loadMessagesForChannel(channel) {
    const container = document.querySelector(".chat-scrollable-" + channel);
    if (container.children.length > 0) container.innerHTML = "";

    const spinner = createHTMLElement("div", null, ["loading-circle"]);
    container.parentNode.appendChild(spinner);

    if (!emotesLoaded) {
        await loadEmotes();
        emotesLoaded = true;
    }
    
    insertMessages(container, await fetch(`https://api.op47.de/v1/twitch/messages/${channel}`).then(response => response.json()));
    spinner.remove();

    if (container.children.length > 0) {
        container.children[container.children.length - 1].scrollIntoView();
        container.scrollTo(0, container.scrollHeight);
    }
}

function insertMessages(container, messages) {
    messages.sort((a, b) => a.timestamp - b.timestamp);

    let lastTimestamp = 0;
    messages.forEach((message) => {
        if (!isSameDay(lastTimestamp, message.timestamp)) container.appendChild(buildNewDayMessage(message.timestamp));
        lastTimestamp = message.timestamp;
        container.appendChild(parseMessage(message));
    });
}

function isSameDay(timestamp1, timestamp2) {
    const d1 = new Date(timestamp1)
    const d2 = new Date(timestamp2)

    return(
        d1.getDate() == d2.getDate() &&
        d1.getMonth() == d2.getMonth() &&
        d1.getFullYear() == d2.getFullYear()
    )
}

function buildNewDayMessage(timestamp) {
    const timeString = "00:00 ".concat(
        new Date(timestamp).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }));

    const container = createHTMLElement("div", null, ["chat-message"])
    const timestampText = createHTMLElement("span", { innerHTML: timeString }, ["chat-timestamp"])

    container.appendChild(timestampText);
    return container;
}

