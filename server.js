const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const PORT = process.env.PORT || 10000;
const app = express();

// HTTP-сервер для Render
const server = http.createServer(app);

// WebSocket-сервер на тому ж порту
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.send('WebSocket server is running');
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

// Сервер слухає порт, який видає Render
server.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
