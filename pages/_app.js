import "../styles/globals.css";
import WebSocketClient from "../js/WebSocketClient";

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <WebSocketClient />
            <Component {...pageProps} />
        </>
    );
}
