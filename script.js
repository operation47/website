function buildChatMessage(timeString, username, message) {
    const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    message.replace(urlRegex, (url) => {
        message = message.replace(
            url,
            `<a class="link" href="${url}" target="_blank">${url}</a>`,
        );
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(
        `
                    <div class="chat-message">
                        <span class="chat-timestamp">${timeString}</span>
                        <span class="chat-username chat-username-${username}">${username}:</span>
                        <span class="chat-text">${message}</span>
                    </div>`,
        "text/html",
    );
    return doc.body.firstChild;
}
function buildNewDayMessage(dateTimeString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
        `
                <div class="chat-message">
                    <span class="chat-timestamp">${dateTimeString}</span>
                </div>`,
        "text/html",
    );
    return doc.body.firstChild;
}
function buildMessageTimeString(timestamp) {
    return new Date(timestamp).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}
function buildNewDayMessageDateTimeString(timestamp) {
    return "00:00 ".concat(
        new Date(timestamp).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    );
}
async function getMessages(channel) {
    const response = await fetch(
        `https://api.op47.de/v1/twitch/messages/${channel}`,
    );
    const json = await response.json();
    return json;
}
function isSameDayGermanTime(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
        d1.getDate() == d2.getDate() &&
        d1.getMonth() == d2.getMonth() &&
        d1.getFullYear() == d2.getFullYear()
    );
}
function insertNewDayMessage(container, timestamp) {
    const newDayString = buildNewDayMessageDateTimeString(timestamp);
    const newDayMessage = buildNewDayMessage(newDayString);
    container.appendChild(newDayMessage);
}
async function insertMessages(container, channel) {
    const messages = await getMessages(channel);
    messages.sort((a, b) => a.timestamp - b.timestamp);

    let lastTimestamp = 0;
    messages.forEach((message) => {
        if (!isSameDayGermanTime(lastTimestamp, message.timestamp))
            insertNewDayMessage(container, message.timestamp);
        lastTimestamp = message.timestamp;
        const chatMessage = buildChatMessage(
            buildMessageTimeString(message.timestamp),
            message.display_name,
            message.content,
        );
        container.appendChild(chatMessage);
    });
}


let reloadInterval;
let isReloadEnabled = true;

function startReloadInterval() {
    reloadInterval = setInterval(function () {
        location.reload();
    }, 60000);
}

function stopReloadInterval() {
    clearInterval(reloadInterval);
}

function toggleReload() {
    const reloadButton = document.getElementById("reload-button");

    if (isReloadEnabled) {
        stopReloadInterval();
        console.log("Auto Reload disabled");
        reloadButton.innerHTML = "Auto Reload <b>OFF</b>";
        reloadButton.style.backgroundColor = "#9d2933";
    } else {
        startReloadInterval();
        console.log("Auto Reload enabled");
        reloadButton.innerHTML = "Auto Reload <b>ON</b>";
        reloadButton.style.backgroundColor = "#26C281";
    }

    isReloadEnabled = !isReloadEnabled;
}


function scrollToBottom() {
    const chats = document.getElementsByClassName("chat-scrollable");

    for (let i = 0; i < chats.length; i++) {
        let children = chats[i].children;
        if (children.length < 1) {
            console.log("No children found");
            continue;
        }
        children[children.length - 1].scrollIntoView();
    }
}

async function main() {
    const stegiChat = document.querySelector(".chat-scrollable-stegi");
    const di1araasChat = document.querySelector(".chat-scrollable-di1araas");

    await insertMessages(stegiChat, "stegi");
    await insertMessages(di1araasChat, "di1araas");

    scrollToBottom();
    startReloadInterval();
}
main();
