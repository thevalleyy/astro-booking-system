const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

// Handle client connections
wss.on("connection", (socket) => {
    console.log("\x1b[35mWS > Client connected");

    socket.on("close", () => {
        console.log("\x1b[35mWS > Client disconnected");
    });

    socket.on("message", (data) => {
        // authenticate the message
        const key = require("../passwords.json")["websocketkey"];

        // format key:message
        const parts = data.toString().split(":");
        if (parts.length !== 2) {
            console.log("\x1b[35mWS > Received invalid message format");
            console.log(data);
            return;
        }

        if (parts[0] !== key) {
            console.log("\x1b[35mWS > Received invalid key");
            console.log(parts[0]);
            return;
        }

        // broadcast just the message to all clients
        wss.clients.forEach(function each(client) {
            if (client !== wss && client.readyState === WebSocket.OPEN) {
                client.send(parts[1]);
            }
        });

        console.log("\x1b[35mWS > Received message: " + data);
    });
});
