let socket;
let username = "";

function setUsername() {
    const input = document.getElementById('nickname');
    username = input.value.trim();
    if (!username) return alert("Введіть ім'я!");

    document.getElementById("login-container").style.display = "none";
    document.getElementById("chat-container").style.display = "block";

    socket = new WebSocket("wss://your-server-url.com"); // Замініть на свій сервер

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: "connect", user: username }));
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

        if (data.type === "users") {
            document.getElementById("users-list").innerHTML = data.users.join(", ");
        } else if (data.type === "message") {
            addMessage(data.user, data.text);
        }
    };
}

function sendMessage() {
    const input = document.getElementById("message");
    const text = input.value.trim();
    if (!text) return;

    socket.send(JSON.stringify({ type: "message", text: text, user: username }));
    addMessage(username, text, true);
    input.value = "";
}

function addMessage(user, text, isSelf = false) {
    const chat = document.getElementById("chat");
    const div = document.createElement("div");
    div.classList.add("message", isSelf ? "my-message" : "other-message");
    div.innerHTML = `<b>${user}:</b> ${text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
