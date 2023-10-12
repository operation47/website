import { createHTMLElement } from "./base.js";
import { parseMessage, loadEmotes } from "./message-parser.js";

let emotesLoaded = false
export async function loadAllChatMessages() {
    loadMessagesForUser("di1araas")
    loadMessagesForUser("stegi")
}

export async function loadMessagesForUser(channel) {
    const container = document.querySelector(".chat-scrollable-" + channel);
    if (container.children.length > 0) container.innerHTML = "";

    const spinner = createHTMLElement("div", null, ["loading-circle"]);
    container.parentNode.appendChild(spinner);

    if (!emotesLoaded) {
        await loadEmotes();
        emotesLoaded = true;
    }
    
    insertMessages(container, await fetch(`https://api.op47.de/v1/twitch/messages/${channel}`).json());
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
    return new Date(timestamp1).toDateString() === new Date(timestamp2).toDateString()
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

