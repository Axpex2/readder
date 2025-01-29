const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 10000;
const app = express();

// Перевіряємо, чи існує папка public
const publicPath = path.join(__dirname, "public");

// Перевіряємо, чи є index.html
const fs = require("fs");
if (!fs.existsSync(path.join(publicPath, "index.html"))) {
    console.error("❌ Помилка: Файл public/index.html не знайдено!");
}

// Роздача статичних файлів
app.use(express.static(publicPath));

// HTTP-сервер
const server = http.createServer(app);

// WebSocket-сервер
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

wss.on('connection', ws => {
    console.log('✅ Новий користувач підключився');

    ws.on('message', message => {
        console.log('📩 Отримано повідомлення:', message);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('❌ Користувач відключився');
    });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
