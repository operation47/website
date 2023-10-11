import { parseMessage, loadEmotes } from "./message-parser.js";

let emotesLoaded = false
export async function loadAllChatMessages() {
    await loadMessagesStegi();
    await loadMessagesDi1araas();
    scrollToBottom();
}

export async function loadMessagesStegi() {
    if (!emotesLoaded) {
        await loadEmotes();
        emotesLoaded = true;
    }
    const containerStegi = document.querySelector(".chat-scrollable-stegi");
    if (containerStegi.children.length > 0) containerStegi.innerHTML = "";

    const spinner = createSpinner();
    containerStegi.parentNode.appendChild(spinner);

    const messagesStegi = await getMessages("stegi");
    insertMessages(containerStegi, messagesStegi);
    spinner.remove();
}

export async function loadMessagesDi1araas() {
    if (!emotesLoaded) {
        await loadEmotes();
        emotesLoaded = true;
    }
    const containerDi1araas = document.querySelector(".chat-scrollable-di1araas");
    if (containerDi1araas.children.length > 0) containerDi1araas.innerHTML = "";
    

    const spinner = createSpinner();
    containerDi1araas.parentNode.appendChild(spinner);

    const messagesDi1araas = await getMessages("di1araas");
    insertMessages(containerDi1araas, messagesDi1araas);
    spinner.remove();
}

function createSpinner() {
    const spinner = document.createElement("div");
    spinner.classList.add("loading-circle");
    return spinner;
}
async function getMessages(channel) {
    const response = await fetch(
        `https://api.op47.de/v1/twitch/messages/${channel}`,
    );
    const json = await response.json();
    return json;
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
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return (
        d1.getDate() == d2.getDate() &&
        d1.getMonth() == d2.getMonth() &&
        d1.getFullYear() == d2.getFullYear()
    );
}

function buildNewDayMessage(timestamp) {
    const timeString = "00:00 ".concat(
        new Date(timestamp).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }));

    const container = document.createElement("div");
    container.classList.add("chat-message");

    const timestampText = document.createElement("span");
    timestampText.classList.add("chat-timestamp");
    timestampText.innerHTML = timeString;

    container.appendChild(timestampText);
    return container;
}

function scrollToBottom() {
    const chats = document.getElementsByClassName("chat-scrollable");
    for (const chat of chats) {
        const children = chat.children;
        if (children.length < 1) continue;
        children[children.length - 1].scrollIntoView();
        chat.scrollTo(0, chat.scrollHeight);
    }
}
