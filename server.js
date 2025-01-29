const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

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

console.log('Сервер WebSocket запущено на https://readder-ft6b.onrender.com/');
