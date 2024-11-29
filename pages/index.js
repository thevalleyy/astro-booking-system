import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

const config = require("../config.json");
const metaData = config["html-meta-data"];

export default function Home() {
    const [status, setStatus] = useState("not started yet");

    const testAPI = async () => {
        setStatus("loading...");
        try {
            const response = await axios.get("/api/testAPI");
            if (response.status === 200) {
                setStatus(response.data.message);
            } else {
                setStatus(response.data.message);
            }
        } catch (error) {
            setStatus("API test failed");
        }
    };

    useEffect(() => {
        // reveal text when "t" is pressed
        window.addEventListener("keydown", (e) => {
            if (e.key === "t") {
                setStatus("useEffect() test passed");
            }
        });
    }, []);
    return (
        <>
            <Head>
                <title>astro-booking-system</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>
            <div className="fullscreen">
                <br></br>
                <div className="center-H">
                    <button type="button" style={{ fontSize: 30 }} onClick={testAPI}>
                        test api
                    </button>
                    <button
                        type="button"
                        style={{ fontSize: 30 }}
                        onClick={() => {
                            window.location.href = "./hjfdksl"; // Use window.location instead of document.location
                        }}
                    >
                        test 404
                    </button>
                    <button
                        type="button"
                        style={{ fontSize: 30 }}
                        onClick={() => {
                            window.location.href = "./amongus.bmp"; // Use window.location instead of document.location
                        }}
                    >
                        test public/
                    </button>
                </div>
                <h1>{status}</h1>
            </div>
        </>
    );
}
