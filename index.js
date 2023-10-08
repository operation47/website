const http = require('http')
const fetch = require('node-fetch')
const express = require('express')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 6969
const httpServer = http.createServer(app)
const API_KEY = 'thgp673DPP3hFJHoTMMS!s4hRhgxLtN@';

app.use(cors(
    {
        origin: "https://op47.de"
    }
))
app.use(express.static(path.join(__dirname, "/public")))
app.use(express.static(path.join(__dirname, "/files")))

const io = new Server(httpServer, { cors: { origin: "*" }, allowEIO3: true });

let viewerCount = 0;
io.on('connection', (socket) => {
    viewerCount++
    io.emit('viewerCount', viewerCount);

    socket.on('disconnect', () => {
        viewerCount--
        io.emit('viewerCount', viewerCount);
    });
});


function appendMessage(chatContainerSelector, chatMessageHTML) {
    try {
        const htmlFilePath = path.join(__dirname, 'index.html')
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8')
        const $ = cheerio.load(htmlContent)
        const chatContainer = $(chatContainerSelector)
        chatContainer.append(chatMessageHTML)
        fs.writeFileSync(htmlFilePath, $.html(), 'utf8')
    } catch (err) {
        throw err
    }
}

function appendDateMessage(date) {
    const dateMessage = `
    <div class="chat-message">
        <span class="chat-timestamp">${date}</span>
    </div>
    `
    try {
        appendMessage('.chat-scrollable-stegi', dateMessage)
        appendMessage('.chat-scrollable-di1araas', dateMessage)
    } catch (err) {
        console.error(`Error appending date message (${date}):`, err);
    }
}

function buildChatMessageHTML(time, username, message) {
    return `
        <div class="chat-message">
        <span class="chat-timestamp">${time}</span>
        <span class="chat-username chat-username-${username}">${username}:</span>
        <span class="chat-text">${message}</span>
        </div>`
}

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'))
});
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'))
})
app.get('/prime', (req, res) => {
    res.sendFile(path.join(__dirname, 'prime.html'))
})
app.get('/lilly', (req, res) => {
    res.sendFile(path.join(__dirname, 'lilly.html'))
})

async function customFetch(url, options) {
    if (!options) {
        options = {};
    }
    if (!options['headers']) {
        options['headers'] = {};
    }
    options['headers']['authorization'] = API_KEY
    return await fetch(url, options)
}

async function getMessages(channel) {
    const url = `https://api.op47.de/v1/twitch/messages/${channel}`;
    const response = await customFetch(url);
    return JSON.parse(await response.text());
}

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
