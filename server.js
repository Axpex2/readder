const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 10000;

let users = new Map();

// Додаємо підтримку статичних файлів з папки public
app.use(express.static(path.join(__dirname, "public")));

// Віддаємо index.html при запиті "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

wss.on("connection", (ws) => {
    console.log("🔵 Новий користувач підключився.");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "connect") {
                users.set(ws, data.user);
                console.log(`🟢 ${data.user} приєднався`);
                broadcastUsers();
            } else if (data.type === "message") {
                broadcast({ type: "message", user: users.get(ws), text: data.text });
            } else if (data.type === "image") {
                broadcast({ type: "image", user: users.get(ws), text: data.text });
            }
        } catch (e) {
            console.error("❌ Помилка у повідомленні:", e);
        }
    });

    ws.on("close", () => {
        console.log(`🔴 ${users.get(ws)} відключився`);
        users.delete(ws);
        broadcastUsers();
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastUsers() {
    const userList = Array.from(users.values());
    broadcast({ type: "users", users: userList });
}

server.listen(port, () => {
    console.log(`🚀 Сервер WebSocket працює на порту ${port}`);
});
