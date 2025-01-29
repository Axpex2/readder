const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 10000;
const app = express();

// Роздаємо статичні файли (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Створюємо HTTP-сервер
const server = http.createServer(app);

// WebSocket-сервер на тому ж порту
const wss = new WebSocket.Server({ server });

let users = new Map();

wss.on('connection', (ws) => {
    console.log('✅ Новий користувач підключився.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "connect") {
                users.set(ws, data.user);
                console.log(`👤 ${data.user} приєднався`);
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

    ws.on('close', () => {
        console.log(`❌ ${users.get(ws)} відключився`);
        users.delete(ws);
        broadcastUsers();
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastUsers() {
    const userList = Array.from(users.values());
    broadcast({ type: "users", users: userList });
}

// Запускаємо сервер
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
