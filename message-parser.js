let emotesDi1araas = [];
let emotesStegi = [];
let emotesGlobal = [];

export async function loadEmotes() {
    const di1araasTwitchId = 645207159;
    const stegiTwitchId = 51304190;

    emotesDi1araas = await get7tvChannelEmotes(di1araasTwitchId);
    emotesStegi = await get7tvChannelEmotes(stegiTwitchId);
    emotesGlobal = await get7tvGlobalEmotes();
}

async function get7tvGlobalEmotes() {
    const url = "https://7tv.io/v3/emote-sets/global";

    const emotes = [];
    const json = await fetch(url).then(response => response.json()));
    for (const emote of json.emotes) {
        emotes.push(
            {
                name: emote.name,
                url: emote.data.host.url,
                files: emote.data.host.files
            }
        );
    }
    return emotes;
}

async function get7tvChannelEmotes(twitchId) {
    const url = `https://7tv.io/v3/users/twitch/${twitchId}`;

    const emotes = [];
    const json = await fetch(url).then(response => response.json()));
    for (const emote of json.emote_set.emotes) {
        emotes.push(
            {
                name: emote.name,
                url: emote.data.host.url,
                files: emote.data.host.files
            }
        );
    }
    return emotes;
}
export function parseMessage(message) {
    // Steps:
    // 1. Fragment the message into <img> tags and text fragments (and add anchor tags inside the text fragments)
    // 2. Take string and add in the display name and timestamp to the message
    // 3. Return the message as a DOM element

    // for now skip the first step as it's the most complicated
    
    const messageFragments = insertEmotes(message.content, message.channel);

    return buildMessage(message.display_name, messageFragments, message.timestamp);
}

function insertEmotes(messageContent, channel) {
    const result = [];
    const words = messageContent.split(" ");
    let textFragmentBuffer = "";

    for (const word of words) {
        let foundEmote = false;

        (channel === "#stegi" ? emotesStegi : emotesDi1araas).find(emote => {
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

        emotesGlobal.find(emote => {
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

    if (textFragmentBuffer.length > 0) result.push(buildTextFragmentElement(textFragmentBuffer));
    return result;
}

function buildTextFragmentElement(text) {
    return createHTMLElement("span", {
        innerHTML: insertAnchorTags(text)
    }, ["chat-text-fragment"])
}

function buildEmoteElement(emote) {
    return createHTMLElement("img", {
        alt: emote.name,
        title: emote.name,
        src: emote.url + "/1x.webp"
    }, ["chat-emote"])
}

function buildMessage(displayName, messageContentFragments, timestamp) {
    const chatMessage = createHTMLElement("div", null, ["chat-message"])
    
    const timestampText = createHTMLElement("span", {
        textContent: getTimeString(timestamp)
    }, ["chat-timestamp"])

    chatMessage.appendChild(timestampText);

    const chatUsername = createHTMLElement("span", {
        textContent: displayName.concat(":")
    }, ["chat-username", "chat-username-" + displayName.toLowerCase()])
    chatMessage.appendChild(chatUsername);

    for (const fragment of messageContentFragments) {
        chatMessage.appendChild(fragment);
    };
    return chatMessage;
}

function getTimeString(timestamp) {
    return new Date(timestamp).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function insertAnchorTags(message) {
    const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return message.replace(urlRegex, (url) => {
        return `<a class="link" href="${url}">${url}</a>`;
    });
}
