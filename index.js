import http from "http";
import fetch from "node-fetch";
import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import cors from "cors";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 6969;
const httpServer = http.createServer(app);
const API_KEY = process.env.API_KEY;
const pool = new pg.Pool();

app.use(
    cors({
        origin: "https://op47.de",
    }),
);
app.use(express.json());
app.use(express.static(join(__dirname, "/public")));
app.use(express.static(join(__dirname, "/files")));

const io = new Server(httpServer, { cors: { origin: "*" }, allowEIO3: true });


let clipViews;

async function loadAllClips() {
    const res = await pool.query("SELECT * FROM clips_aggregate");
    // collect all ids and view counters in one obj with the id used as key
    clipViews = res.rows.reduce((acc, clip) => {
        acc[clip.id] = { views: clip.views, author: clip.author };
        return acc;
    }, {})
}

loadAllClips();


let visitorCount = 0;

io.on("connection", (socket) => {
    visitorCount++;
    io.emit("visitorCount", visitorCount);

    socket.on("disconnect", () => {
        visitorCount--;
        io.emit("visitorCount", visitorCount);
    });

    socket.on("getAuthorForClip", (id) => {
        const author = id in clipViews ? clipViews[id].author : "unknown";
        socket.emit("author", [id, author]);
    })
    socket.on("getViewsForClip", (id) => { 
        const views = id in clipViews ? clipViews[id].views : 0;
        socket.emit("newViewForClip", [id, views]);
    })
    socket.on("newViewForClip", async (id)=> {
        if (id in clipViews) {
            const views = ++clipViews[id].views;
            pool.query(`UPDATE clips_aggregate SET views=${views} WHERE id=${id}`);
            io.emit("newViewForClip", [id, views]);
        }
    })
    

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
app.get("/wiki-page.js", (req, res) => {
    sendFileSafe(req, res, "/wiki-page.js", "wiki-page.js");
});
app.get("/create-wiki.js", (req, res) => {
    sendFileSafe(req, res, "/create-wiki.js", "create-wiki.js");
});
app.get("/wiki-page.css", (req, res) => {
    sendFileSafe(req, res, "/wiki-page.css", "wiki-page.css");
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
app.get("/wiki/create", (req, res) => {
    sendFileSafe(req, res, `/wiki/create`, "create_wiki.html");
});
app.get("/wiki", (req, res) => {
    res.redirect("/wiki/startseite");
});
app.get("/wiki/:page", (req, res) => {
    res.sendFile(join(__dirname, "pages", "wiki_page.html"));
    //sendFileSafe(req, res, `/wiki/${req.params.page}`, "wiki_page.html");
});
app.post("/comm/new_message", (req, res) => {
    if (!req.body.channel) {
        res.status(400).send("Bad request");
        return;
    }
    io.emit("newMessage", req.body.channel);
    res.status(200).send("OK");
});

app.get("/comm/new_clip", async (req, res) => {
    await loadAllClips();
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
