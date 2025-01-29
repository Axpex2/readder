const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const port = process.env.PORT || 10000;

// Створюємо HTTP-сервер
const server = http.createServer(app);

// Підключаємо WebSocket до цього сервера
const wss = new WebSocket.Server({ server });

let users = new Map();

wss.on("connection", (ws) => {
    console.log("Новий користувач підключився.");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "connect") {
                users.set(ws, data.user);
                console.log(`${data.user} приєднався`);
                broadcastUsers();
            } else if (data.type === "message") {
                broadcast({ type: "message", user: users.get(ws), text: data.text });
            } else if (data.type === "image") {
                broadcast({ type: "image", user: users.get(ws), text: data.text });
            }
        } catch (e) {
            console.error("Помилка у повідомленні:", e);
        }
    });

    ws.on("close", () => {
        console.log(`${users.get(ws)} відключився`);
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

// Роздаємо статичні файли (наприклад, HTML, JS)
app.use(express.static("public"));

server.listen(port, () => {
    console.log(`Сервер WebSocket та HTTP працює на порту ${port}`);
});
