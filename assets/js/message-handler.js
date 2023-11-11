import {
    parseMessage,
    get7tvGlobalEmotes,
    get7tvChannelEmotes,
} from "./message-parser.js";

const di1araasTwitchId = 645207159;
const stegiTwitchId = 51304190;
const firstTimestampSet = {
    "stegi": false,
    "di1araas": false
}

export async function loadAllChatMessages() {
    const result = await Promise.all([
        loadMessages("stegi"),
        loadMessages("di1araas"),
    ]);
    loadEmotes(result[0], result[1]);

    // no new messages handling
    for (const r of result) {
        if (r.length == 0){
            const channel = result.indexOf(r) == 0 ? "stegi" : "di1araas";
            const container = document.querySelector(`.chat-scrollable-${channel}`);
            const div = document.createElement("div");
            div.classList.add("no-messages-alert");
            const manno = new Image();
            manno.src = "https://cdn.7tv.app/emote/609ef9394c18609a1d9b10e1/1x.webp"
            const text = document.createElement("span");
            text.innerHTML = "Keine neuen Nachrichten";

            div.appendChild(manno);
            div.appendChild(text);
            container.appendChild(div);
        }
    }
}

async function loadMessages(user) {
    const container = document.querySelector(`.chat-scrollable-${user}`);
    if (container.children.length > 0) container.innerHTML = "";

    const spinner = createSpinner();
    container.parentNode.appendChild(spinner);

    const messages = await getMessages(user);
    const messagesDom = [];

    messages.sort((a, b) => a.timestamp - b.timestamp);

    let lastTimestamp = 0;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    messages.forEach((message) => {
        if (!isSameDay(lastTimestamp, message.timestamp)) {
            let firstTimestamp = false;
            if (!firstTimestampSet[user]) {
                firstTimestampSet[user] = true;

                if (isSameDay(message.timestamp, threeDaysAgo)) {
                    firstTimestamp = true;
                }
            }

            container.appendChild(buildNewDayMessage(message.timestamp, firstTimestamp));
            lastTimestamp = message.timestamp;
        }
        const newElement = buildTextMessage(
            message.timestamp,
            message.display_name,
            message.content,
        );
        container.appendChild(newElement);
        messagesDom.push({
            message: message,
            element: newElement,
        });
    });
    spinner.remove();
    container.scrollTo(0, container.scrollHeight);

    return messagesDom;
}

// TODO: This is a mess [danke copilot]
export async function loadEmotes(messageDom1, messageDom2) {
    const result = await Promise.all([
        get7tvGlobalEmotes(),
        get7tvChannelEmotes(stegiTwitchId),
        get7tvChannelEmotes(di1araasTwitchId),
    ]);
    replaceWithEmotes(messageDom1, result[1], result[0]);
    replaceWithEmotes(messageDom2, result[2], result[0]);
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

function buildTextMessage(timestamp, displayName, messageContent) {
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

function buildNewDayMessage(timestamp, firstTimestamp) {
    let timeString = "00:00 "
    if (firstTimestamp) {
        timeString = getTimeStringFromDate(new Date()) + " "
    }

    const dateString = timeString.concat(
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
    timestampText.innerHTML = dateString;

    container.appendChild(timestampText);
    return container;
}

function getTimeString(timestamp) {
    return getTimeStringFromDate(new Date(timestamp))
}

function getTimeStringFromDate(date) {
    return date.toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
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
