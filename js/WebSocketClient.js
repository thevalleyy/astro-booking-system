import { useEffect } from "react";

/**
 * Create a WebSocket client that listens for messages from the server.
 */
export default function WebSocketClient() {
    useEffect(() => {
        // open websocket connection on port 8080
        const ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (message) => {
            if (message.data === "refresh") {
                console.log("Refresh signal received");
                document.getElementById("refreshButton")?.click(); // Click the refresh button
            } else if (message.data === "reload") {
                console.log("Reload signal received");
                if (window.location.pathname == "/table") window.location.reload();
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            // trigger websocket error notification
            document.getElementById("wsError")?.click();
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => ws.close();
    }, []);

    return null;
}
