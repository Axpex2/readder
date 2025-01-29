const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 10000;
const app = express();

// Статичні файли (index.html)
app.use(express.static(path.join(__dirname, "public")));

// HTTP-сервер
const server = http.createServer(app);

// WebSocket-сервер
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

wss.on('connection', ws => {
    console.log('✅ Новий користувач підключився');

    ws.on('message', message => {
        // Конвертуємо Buffer у текст (UTF-8)
        const textMessage = message.toString('utf-8');
        console.log('📩 Отримано повідомлення:', textMessage);

        // Відправляємо повідомлення ВСІМ підключеним клієнтам
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(textMessage);
            }
        });

        // Відправляємо копію повідомлення назад тому, хто надіслав
        ws.send(`Ви: ${textMessage}`);
    });

    ws.on('close', () => {
        console.log('❌ Користувач відключився');
    });
});

// Запускаємо сервер
server.listen(PORT, () => {
    console.log(`🚀 Сервер WebSocket запущено на порту ${PORT}`);
});
