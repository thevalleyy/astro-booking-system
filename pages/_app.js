import "../styles/globals.css";
import WebSocketClient from "../js/WebSocketClient";

function MyApp({ Component, pageProps }) {
    return (
        <>
            <WebSocketClient />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
