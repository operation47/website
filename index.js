import http from 'http';
import fetch from 'node-fetch';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
const port = process.env.PORT || 6969
const httpServer = http.createServer(app)
const API_KEY = process.env.API_KEY;

app.use(cors(
    {
        origin: "https://op47.de"
    }
))
app.use(express.static(join(__dirname, "/public")))
app.use(express.static(join(__dirname, "/files")))

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


app.get('/', async (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});
app.get('/script.js', (req, res) => {
    res.sendFile(join(__dirname, 'script.js'))
});
app.get('/message-parser.js', (req, res) => {
    res.sendFile(join(__dirname, 'message-parser.js'))
});
app.get('/style.css', (req, res) => {
    res.sendFile(join(__dirname, 'style.css'))
})
app.get('/prime', (req, res) => {
    res.sendFile(join(__dirname, 'prime.html'))
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
