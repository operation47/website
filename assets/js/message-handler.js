import {
    parseMessage,
    get7tvGlobalEmotes,
    get7tvChannelEmotes,
} from "./message-parser.js";

const di1araasTwitchId = 645207159;
const stegiTwitchId = 51304190;
let messagesDomStegi = [];
let messagesDomDi1araas = [];

export async function loadAllChatMessagesNew() {
    await Promise.all([loadMessagesStegi(), loadMessagesDi1araas()]);
    loadEmotesNew();
}

async function loadMessagesDi1araas() {
    const containerDi1araas = document.querySelector(
        ".chat-scrollable-di1araas",
    );
    if (containerDi1araas.children.length > 0) containerDi1araas.innerHTML = "";

    const spinner = createSpinner();
    containerDi1araas.parentNode.appendChild(spinner);

    const messagesDi1araas = await getMessages("di1araas");

    messagesDi1araas.sort((a, b) => a.timestamp - b.timestamp);

    let lastTimestamp = 0;
    messagesDi1araas.forEach((message) => {
        if (!isSameDay(lastTimestamp, message.timestamp)) {
            containerDi1araas.appendChild(
                buildNewDayMessage(message.timestamp),
            );
            lastTimestamp = message.timestamp;
        }
        const newElement = buildMessageNewTextOnly(
            message.timestamp,
            message.display_name,
            message.content,
        );
        containerDi1araas.appendChild(newElement);
        messagesDomDi1araas.push({
            message: message,
            element: newElement,
        });
        spinner.remove();
        containerDi1araas.scrollTo(0, containerDi1araas.scrollHeight);
    });
}
async function loadMessagesStegi() {
    const containerStegi = document.querySelector(".chat-scrollable-stegi");
    if (containerStegi.children.length > 0) containerStegi.innerHTML = "";

    const spinner = createSpinner();
    containerStegi.parentNode.appendChild(spinner);

    const messagesStegi = await getMessages("stegi");

    messagesStegi.sort((a, b) => a.timestamp - b.timestamp);

    let lastTimestamp = 0;
    messagesStegi.forEach((message) => {
        if (!isSameDay(lastTimestamp, message.timestamp)) {
            containerStegi.appendChild(buildNewDayMessage(message.timestamp));
            lastTimestamp = message.timestamp;
        }
        const newElement = buildMessageNewTextOnly(
            message.timestamp,
            message.display_name,
            message.content,
        );
        containerStegi.appendChild(newElement);
        messagesDomStegi.push({
            message: message,
            element: newElement,
        });
        spinner.remove();
        containerStegi.scrollTo(0, containerStegi.scrollHeight);
    });
}

export async function loadEmotesNew() {
    const result = await Promise.all([
        get7tvGlobalEmotes(),
        get7tvChannelEmotes(di1araasTwitchId),
        get7tvChannelEmotes(stegiTwitchId),
    ]);
    replaceWithEmotes(messagesDomDi1araas, result[1], result[0]);
    replaceWithEmotes(messagesDomStegi, result[2], result[0]);
}

async function replaceWithEmotes(messageDom, channelEmotes, globalEmotes) {
    for (let i = messageDom.length - 1; i >= 0; i--) {
        const newMessage = parseMessage(
            messageDom[i].message,
            channelEmotes,
            globalEmotes,
        );
        const oldMessage = messageDom.pop();
        oldMessage.element.replaceWith(newMessage);
    }
}

function buildMessageNewTextOnly(timestamp, displayName, messageContent) {
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message");

    const timestampText = document.createElement("span");
    timestampText.classList.add("chat-timestamp");
    timestampText.textContent = getTimeString(timestamp);
    chatMessage.appendChild(timestampText);

    const chatUsername = document.createElement("span");
    chatUsername.classList.add("chat-username");
    chatUsername.classList.add("chat-username-" + displayName.toLowerCase());
    chatUsername.textContent = displayName.concat(":");
    const link = document.createElement("a");
    link.href = "https://twitch.tv/" + displayName.toLowerCase();
    link.target = "_blank";
    link.appendChild(chatUsername);

    chatMessage.appendChild(link);

    const textElement = document.createElement("span");
    textElement.classList.add("chat-text-fragment");
    textElement.innerHTML = messageContent;
    chatMessage.appendChild(textElement);

    return chatMessage;
}

function getTimeString(timestamp) {
    return new Date(timestamp).toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export async function loadAllChatMessages() {
    await Promise.all([loadMessagesStegi(), loadMessagesDi1araas()]);
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
        }),
    );

    const container = document.createElement("div");
    container.classList.add("chat-message");

    const timestampText = document.createElement("span");
    timestampText.classList.add("chat-timestamp");
    timestampText.innerHTML = timeString;

    container.appendChild(timestampText);
    return container;
}
