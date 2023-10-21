export async function get7tvGlobalEmotes() {
    const url = "https://7tv.io/v3/emote-sets/global";

    const emotes = [];
    const response = await fetch(url);
    const json = await response.json();

    for (const emote of json.emotes) {
        emotes.push({
            name: emote.name,
            url: emote.data.host.url,
            files: emote.data.host.files,
        });
    }
    return emotes;
}

export async function get7tvChannelEmotes(twitchId) {
    const url = `https://7tv.io/v3/users/twitch/${twitchId}`;

    const emotes = [];
    const response = await fetch(url);
    const json = await response.json();
    try {
        for (const emote of json.emote_set.emotes) {
            emotes.push({
                name: emote.name,
                url: emote.data.host.url,
                files: emote.data.host.files,
            });
        }
    } catch (err) {
        console.log(err);
    }

    return emotes;
}

export function parseMessage(message, channelEmotes, globalEmotes) {
    const messageFragments = insertEmotes(
        message.content,
        channelEmotes,
        globalEmotes,
    );
    return buildMessage(
        message.display_name,
        messageFragments,
        message.timestamp,
    );
}

function insertEmotes(messageContent, channelEmotes, globalEmotes) {
    const result = [];
    const words = messageContent.split(" ");
    let textFragmentBuffer = "";

    for (const word of words) {
        let foundEmote = false;

        channelEmotes.find((emote) => {
            if (emote.name === word) {
                if (textFragmentBuffer.length > 0) {
                    result.push(buildTextFragmentElement(textFragmentBuffer));
                    textFragmentBuffer = "";
                }
                result.push(buildEmoteElement(emote));
                foundEmote = true;
            }
        });
        if (foundEmote) continue;

        globalEmotes.find((emote) => {
            if (emote.name === word) {
                if (textFragmentBuffer.length > 0) {
                    result.push(buildTextFragmentElement(textFragmentBuffer));
                    textFragmentBuffer = "";
                }
                result.push(buildEmoteElement(emote));
                foundEmote = true;
            }
        });
        if (foundEmote) continue;

        if (textFragmentBuffer.length > 0) textFragmentBuffer += " ";
        textFragmentBuffer += word;
    }

    if (textFragmentBuffer.length > 0)
        result.push(buildTextFragmentElement(textFragmentBuffer));
    return result;
}

function buildTextFragmentElement(text) {
    const textElement = document.createElement("span");
    textElement.classList.add("chat-text-fragment");
    textElement.innerHTML = insertAnchorTags(text);
    return textElement;
}

function buildEmoteElement(emote) {
    const emoteElement = document.createElement("img");
    emoteElement.classList.add("chat-emote");
    emoteElement.alt = emote.name;
    emoteElement.title = emote.name;
    emoteElement.src = emote.url + "/1x.webp";
    return emoteElement;
}

function buildMessage(displayName, messageContentFragments, timestamp) {
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

    for (const fragment of messageContentFragments) {
        chatMessage.appendChild(fragment);
    }
    return chatMessage;
}

function getClockTimeString(timestamp) {
    return new Date(timestamp).toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}
function insertAnchorTags(message) {
    const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return message.replace(urlRegex, (url) => {
        return `<a class="link" href="${url}">${url}</a>`;
    });
}
