const WebSocket = require('ws');

const PORT = process.env.PORT || 3000; // Динамічний порт або 3000 як резерв
const server = new WebSocket.Server({ port: PORT });

server.on('connection', socket => {
    console.log('Новий користувач підключився');

    socket.on('message', message => {
        console.log('Отримано повідомлення:', message);
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        console.log('Користувач відключився');
    });
});

console.log(`Сервер WebSocket запущено на порту ${PORT}`);
