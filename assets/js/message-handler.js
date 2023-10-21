import { parseMessage, loadEmotes, get7tvGlobalEmotes, get7tvChannelEmotes } from "./message-parser.js";


let emotesLoadedPromise = null;
let messagesDomStegi = [];
let messagesDomDi1araas = [];
let emotesDi1araas = [];
let emotesStegi = [];
let emotesGlobal = [];

export async function loadAllChatMessagesNew() {
    const containerStegi = document.querySelector(".chat-scrollable-stegi");
    const containerDi1araas = document.querySelector(".chat-scrollable-di1araas");

    if (containerStegi.children.length > 0) containerStegi.innerHTML = "";
    if (containerDi1araas.children.length > 0) containerDi1araas.innerHTML = "";
    const spinner = createSpinner();
    const spinner2 = createSpinner();
    containerStegi.parentNode.appendChild(spinner);
    containerDi1araas.parentNode.appendChild(spinner2);
    const messagesStegi = await getMessages("stegi");
    const messagesDi1araas = await getMessages("di1araas");

    if (messagesStegi.length > 0) containerStegi.innerHTML = "";
    if (messagesDi1araas.length > 0) containerDi1araas.innerHTML = "";

    messagesStegi.sort((a, b) => a.timestamp - b.timestamp);
    messagesDi1araas.sort((a, b) => a.timestamp - b.timestamp);

    messagesStegi.forEach((message) => {
        const newElement = buildMessageNewTextOnly(message.timestamp, message.display_name, message.content);
        containerStegi.appendChild(newElement);
        messagesDomStegi.push( {
            message: message,
            element: newElement
        });
        spinner.remove();
        containerStegi.scrollTo(0, containerStegi.scrollHeight);
    });
    messagesDi1araas.forEach((message) => {
        const newElement = buildMessageNewTextOnly(message.timestamp, message.display_name, message.content);
        containerDi1araas.appendChild(newElement);
        messagesDomDi1araas.push( {
            message: message,
            element: newElement
        });
        spinner2.remove();
        containerDi1araas.scrollTo(0, containerDi1araas.scrollHeight);
    });

    loadEmotesNew();
}

const di1araasTwitchId = 645207159;
const stegiTwitchId = 51304190;
export async function loadEmotesNew() {
    const result = await Promise.all([get7tvGlobalEmotes(), get7tvChannelEmotes(di1araasTwitchId), get7tvChannelEmotes(stegiTwitchId)]);
    emotesGlobal = result[0];
    emotesDi1araas = result[1];
    emotesStegi = result[2];
    loadStegiEmotes();
    loadDi1araasEmotes();
}
async function loadStegiEmotes() {
    for (let i = messagesDomStegi.length - 1; i >= 0; i--) {
        const newMessage = parseMessage(messagesDomStegi[i].message, emotesStegi, emotesGlobal);
        const oldMessage = messagesDomStegi.pop();
        oldMessage.element.replaceWith(newMessage);
    }
}
async function loadDi1araasEmotes() {
    for (let i = messagesDomDi1araas.length - 1; i >= 0; i--) {
        const newMessage = parseMessage(messagesDomDi1araas[i].message, emotesDi1araas, emotesGlobal);
        const oldMessage = messagesDomDi1araas.pop();
        oldMessage.element.replaceWith(newMessage);
    }
}

function buildMessageNewTextOnly(timestamp, displayName, messageContent) {
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message");

    const timestampText = document.createElement("span");
    timestampText.classList.add("chat-timestamp");
    timestampText.textContent = getClockTimeString(timestamp);
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

function getClockTimeString(timestamp) {
    return new Date(timestamp).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
export async function loadAllChatMessages() {
    await Promise.all([loadMessagesStegi(), loadMessagesDi1araas()]); 
}

export async function loadMessagesStegi() {
    const containerStegi = document.querySelector(".chat-scrollable-stegi");
    if (containerStegi.children.length > 0) containerStegi.innerHTML = "";

    const spinner = createSpinner();
    containerStegi.parentNode.appendChild(spinner);

    if (!emotesLoadedPromise) {
        emotesLoadedPromise = loadEmotes();
    }
    await emotesLoadedPromise;

    const messagesStegi = await getMessages("stegi");
    insertMessages(containerStegi, messagesStegi);
    spinner.remove();
    
    containerStegi.scrollTo(0, containerStegi.scrollHeight);
}

export async function loadMessagesDi1araas() {
    const containerDi1araas = document.querySelector(".chat-scrollable-di1araas");
    if (containerDi1araas.children.length > 0) containerDi1araas.innerHTML = "";
    

    const spinner = createSpinner();
    containerDi1araas.parentNode.appendChild(spinner);

    if (!emotesLoadedPromise) {
        emotesLoadedPromise = loadEmotes();
    }
    await emotesLoadedPromise;

    const messagesDi1araas = await getMessages("di1araas");
    insertMessages(containerDi1araas, messagesDi1araas);
    spinner.remove();

    containerDi1araas.scrollTo(0, containerDi1araas.scrollHeight);
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
