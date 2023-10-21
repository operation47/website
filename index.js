import http from "http";
import fetch from "node-fetch";
import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import cors from "cors";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 6969;
const httpServer = http.createServer(app);
const API_KEY = process.env.API_KEY;

app.use(
    cors({
        origin: "https://op47.de",
    }),
);
app.use(express.static(join(__dirname, "/public")));
app.use(express.static(join(__dirname, "/files")));

const io = new Server(httpServer, { cors: { origin: "*" }, allowEIO3: true });

let viewerCount = 0;
io.on("connection", (socket) => {
    viewerCount++;
    io.emit("viewerCount", viewerCount);

    socket.on("disconnect", () => {
        viewerCount--;
        io.emit("viewerCount", viewerCount);
    });
});

function sendFileSafe(req, res, url, filepath) {
    let type = filepath.split(".")[1];
    if (type === "js") type = join("assets", "js");
    else if (type === "html") type = "pages";
    else if (type === "css") type = "assets";

    if (req.url === url) {
        res.sendFile(join(__dirname, type, filepath));
    } else {
        res.status(404).send("Not found");
    }
}

app.get("/style.css", (req, res) => {
    sendFileSafe(req, res, "/style.css", "style.css");
});
app.get("/script.js", (req, res) => {
    sendFileSafe(req, res, "/script.js", "script.js");
});
app.get("/message-parser.js", (req, res) => {
    sendFileSafe(req, res, "/message-parser.js", "message-parser.js");
});
app.get("/message-handler.js", (req, res) => {
    sendFileSafe(req, res, "/message-handler.js", "message-handler.js");
});
app.get("/chat-stuff.js", (req, res) => {
    sendFileSafe(req, res, "/chat-stuff.js", "chat-stuff.js");
});

app.get("/", async (req, res) => {
    sendFileSafe(req, res, "/", "index.html");
});
app.get("/prime", (req, res) => {
    sendFileSafe(req, res, "/prime", "prime.html");
});
app.get("/recap", (req, res) => {
    sendFileSafe(req, res, "/recap", "recap.html");
});
app.get("/credits", (req, res) => {
    sendFileSafe(req, res, "/credits", "credits.html");
});

app.get("/comm/new_message", (req, res) => {
    io.emit("newMessage");
    res.status(200).send("OK");
});

app.get("/comm/new_clip", (req, res) => {
    io.emit("newClip");
    res.status(200).send("OK");
});

async function customFetch(url, options) {
    if (!options) {
        options = {};
    }
    if (!options["headers"]) {
        options["headers"] = {};
    }
    options["headers"]["authorization"] = API_KEY;
    return await fetch(url, options);
}

async function getMessages(channel) {
    const url = `https://api.op47.de/v1/twitch/messages/${channel}`;
    const response = await customFetch(url);
    return JSON.parse(await response.text());
}

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
