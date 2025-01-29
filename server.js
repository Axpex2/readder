const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 10000;
const app = express();

// Роздача статичних файлів (щоб HTML відкривався)
app.use(express.static(path.join(__dirname, "public")));

// HTTP-сервер
const server = http.createServer(app);

// WebSocket-сервер
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

wss.on('connection', ws => {
    console.log('Новий користувач підключився');

    ws.on('message', message => {
        console.log('Отримано повідомлення:', message);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Користувач відключився');
    });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
