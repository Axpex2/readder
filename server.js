const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let users = new Map(); // Зберігаємо { socket: username }

wss.on('connection', (ws) => {
    console.log('Новий користувач підключився.');

    ws.on('message', (message) => {
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

    ws.on('close', () => {
        console.log(`${users.get(ws)} відключився`);
        users.delete(ws);
        broadcastUsers();
    });
});

// Функція для відправки всім підключеним користувачам
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Оновлення списку онлайн-користувачів
function broadcastUsers() {
    const userList = Array.from(users.values());
    broadcast({ type: "users", users: userList });
}

console.log("Сервер WebSocket працює на ws://localhost:8080");
