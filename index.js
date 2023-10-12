import http from 'http';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
const port = process.env.PORT || 6969
const httpServer = http.createServer(app)

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

function sendFileSafe(req, res, url, filepath){
    if (req.url === url) {
        res.sendFile(join(__dirname, filepath));
    } else {
        res.status(404).send('Not found');
    }
}

/** Resource Routes */
app.get('/script.js', (req, res) => {
    sendFileSafe(req, res, '/script.js', 'script.js');
});
app.get('/message-parser.js', (req, res) => {
    sendFileSafe(req, res, '/message-parser.js', 'message-parser.js');
});
app.get('/message-handler.js', (req, res) => {
    sendFileSafe(req, res, '/message-handler.js', 'message-handler.js');
});
app.get('/style.css', (req, res) => {
    sendFileSafe(req, res, '/style.css', 'style.css');
});

/** HTML Page Routes */
app.get('/', async (req, res) => {
    sendFileSafe(req, res, '/', 'index.html');
});
app.get('/prime', (req, res) => {
    sendFileSafe(req, res, '/prime', 'prime.html');
});
app.get('/recap', (req, res) => {
    sendFileSafe(req, res, '/recap', 'recap.html');
});
app.get('/fuerLxllv', (req, res) => {
    sendFileSafe(req, res, 'fuerLxllv', 'lilly.html');
});
app.get('/credits', (req, res) => {
    sendFileSafe(req, res, '/credits', 'credits.html');
});

/** Event Routes */
app.get('/comm/new_message', (_req, res) => {
    io.emit('newMessage');
    res.status(200).send('OK');
});

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
