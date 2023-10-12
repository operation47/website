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

function registerRoute(route, htmlFile) {
    if (htmlFile) {
        app.get(route, async (req, res) => {
            sendFileSafe(req, res, route, 'index.html');
        });
    } else {
        app.get(route, (req, res) => {
            sendFileSafe(req, res, route, route)
        })
    }
}

/** Resource Routes */
registerRoute('/script.js');
registerRoute('/base.js');
registerRoute('/message-parser.js');
registerRoute('/message-handler.js');
registerRoute('/style.css');

/** HTML Page Routes */
registerRoute('/', 'index.html');
registerRoute('/prime', 'prime.html');
registerRoute('/recap', 'recap.html');
registerRoute('/fuerLxllv', 'lilly.html');
registerRoute('/credits', 'credits.html');

/** Event Routes */
app.get('/comm/new_message', (_req, res) => {
    io.emit('newMessage');
    res.status(200).send('OK');
});

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
