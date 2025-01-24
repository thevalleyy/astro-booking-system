import { WebSocketServer } from "ws";
import WebSocket from "ws";
import config from "../config.json" with { type: "json" };
const wsPort = config.settings.wsPort;
const wss = new WebSocketServer({ port: wsPort });

import passwords from "../passwords.json" with { type: "json" };
const key = passwords["websocketkey"];

// Handle client connections
wss.on("connection", (socket) => {
    console.log("\x1b[35mWS > Client connected");

    socket.on("close", () => {
        console.log("\x1b[35mWS > Client disconnected");
    });

    socket.on("message", (data) => {
        // authenticate the message

        // format key:message
        const parts = data.toString().split(":");
        if (parts.length !== 2) {
            // console.log("\x1b[35mWS > Received invalid message format");
            // console.log(data);
            return;
        }

        if (parts[0] !== key) {
            // console.log("\x1b[35mWS > Received invalid key");
            // console.log(parts[0]);
            return;
        }

        console.log("\x1b[35mWS > Received message: " + data);

        // broadcast just the message to all clients
        // wait 1 second before sending
        setTimeout(() => {
            wss.clients.forEach(function each(client) {
                if (client !== wss && client.readyState === WebSocket.OPEN) {
                    client.send(parts[1]);
                }
            });
        }, 1000);
    });
});
