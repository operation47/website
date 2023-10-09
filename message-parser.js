export function parseMessage(displayName, messageContent, timestamp) {

    // Steps:
    // 1. Insert <img> tags with the right source emotes from twitch, 7tv, bttv, ffz in that order
    // 2. Insert url anchors
    // 3. Take string and add in the display name and timestamp to the message
    // 4. Return the message as a DOM element

    // for now skip the first step as it's the most complicated
    messageContent = insertAnchorTags(messageContent);

    const messageFragments = [stringToDomElement(messageContent)]

    return buildMessage(displayName, messageFragments, getClockTimeString(timestamp));
}
function buildMessage(displayName, messageContentFragments, timeString) {
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message");

    const timestamp = document.createElement("span");
    timestamp.classList.add("chat-timestamp");
    timestamp.textContent = timeString;
    chatMessage.appendChild(timestamp);

    const chatUsername = document.createElement("span");
    chatUsername.classList.add("chat-username");
    chatUsername.classList.add("chat-username-" + displayName.toLowerCase());
    chatUsername.textContent = displayName.concat(":");
    chatMessage.appendChild(chatUsername);

    for (const fragment of messageContentFragments) {
        chatMessage.appendChild(fragment);
    };
    return chatMessage;
}
function getClockTimeString(timestamp) {
    return new Date(timestamp).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
function insertAnchorTags(message) {
    const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return message.replace(urlRegex, (url) => {
        return `<a class="link" href="${url}">${url}</a>`;
    });
}

function stringToDomElement(string) {
  const parser = new DOMParser();
  return parser.parseFromString(string, "text/html").body.firstChild;
}
