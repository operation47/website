export function parseMessage(displayName, messageContent, timestamp, isStegi) {

    // Steps:
    // 1. Insert <img> tags with the right source emotes from twitch, 7tv, bttv, ffz in that order
    // 2. Insert url anchors
    // 3. Take string and add in the display name and timestamp to the message
    // 4. Return the message as a DOM element

    // for now skip the first step as it's the most complicated
    

    // do later on each message fragment messageContent = insertAnchorTags(messageContent);

    const messageFragments = insertEmotes(messageContent, isStegi);

    return buildMessage(displayName, messageFragments, getClockTimeString(timestamp));
}

function insertEmotes(messageContent, isStegi) {
    const result = [];
    const words = messageContent.split(" ");
    let textFragmentBuffer = "";

    for (const word of words) {
        //console.log("check word: " + word);
        let foundEmote = false;
        (isStegi ? emotesStegi : emotesDi1araas).find(emote => {
            if (emote.name === word) {
                // text fragment if buffer is not empty
                if (textFragmentBuffer.length > 0) {
                    //console.log("insert text fragment");
                    result.push(buildTextFragmentElement(textFragmentBuffer));
                    textFragmentBuffer = "";
                }

                //console.log("insert emote");
                result.push(buildEmoteElement(emote));
                foundEmote = true;
            }
        });
        if (foundEmote) {
            //console.log("trigger continue");
            continue;
        }
        emotesGlobal.find(emote => {
            if (emote.name === word) {
                // text fragment if buffer is not empty
                if (textFragmentBuffer.length > 0) {
                    //console.log("insert text fragment");
                    result.push(buildTextFragmentElement(textFragmentBuffer));
                    textFragmentBuffer = "";
                }

                result.push(buildEmoteElement(emote));
                foundEmote = true;
            }
        });
        if (foundEmote) {
            //console.log("trigger continue");
            continue;
        }

        //console.log("textfragmentbuffer length: " + textFragmentBuffer.length);
        if (textFragmentBuffer.length > 0) {
            //console.log("add space to buffer")
            textFragmentBuffer += " ";
        }

        //console.log("add word to buffer");
        textFragmentBuffer += word;
    }

    if (textFragmentBuffer.length > 0) {
        //console.log("insert text fragment because buffer is not empty after loop");
        result.push(buildTextFragmentElement(textFragmentBuffer));
    }

    return result;
}

function buildTextFragmentElement(text) {
    const textElement = document.createElement("span");
    textElement.classList.add("chat-text-fragment");
    textElement.textContent = text;
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

let emotesDi1araas = [];
let emotesStegi = [];
let emotesGlobal = [];

export async function loadEmotes() {
    /*
    const emote_structure = {
        name: "test",
        urls: {
            1: "testurl"
        }
    };
    */
    const di1araasTwitchId = 645207159;
    const stegiTwitchId = 51304190;

    emotesDi1araas = await get7tvChannelEmotes(di1araasTwitchId);
    emotesStegi = await get7tvChannelEmotes(stegiTwitchId);
    emotesGlobal = await get7tvGlobalEmotes();
}

async function get7tvGlobalEmotes() {
    const url = "https://7tv.io/v3/emote-sets/global";
    const response = await fetch(url);
    const json = await response.json();
    const emoteStrings = [];
    
    for (const emote of json.emotes) {
        emoteStrings.push(
            {
                name: emote.name,
                url: emote.data.host.url,
                files: emote.data.host.files
            }
        );
    }
    return emoteStrings;
}

async function get7tvChannelEmotes(twitchId) {
    const url = `https://7tv.io/v3/users/twitch/${twitchId}`;

    const emoteStrings = [];
    const response = await fetch(url);
    const json = await response.json();
    for (const emote of json.emote_set.emotes) {
        emoteStrings.push(
            {
                name: emote.name,
                url: emote.data.host.url,
                files: emote.data.host.files
            }
        );
    }
    return emoteStrings;
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


// call https://7tv.io/v3/emote-sets/global
// https://7tv.io/v3/users/twitch/{channel_id}
// 
// 51304190 stegi
// 645207159 di1araas
