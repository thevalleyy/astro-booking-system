import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

import alertBox from "../js/alertBox";
import config from "../config.json" with { type: "json" };
const metaData = config["html-meta-data"];
const title = config.settings.title;

async function requestData(autologin = false) {
    const password = document.getElementById("password")?.value;
    if (!password && !autologin) return alertBox("Please enter a password.", "error");

    await axios
        .post("/api/login", { password: password })
        .then((res) => {
                window.location.href = "./admin";
        })
        .catch((error) => {
            if (error?.response?.data.code === 400) return; // no password provided on autologin
            if (autologin && error?.response?.data.code === 401) return alertBox("Autologin failed due to an invalid password. Please enter it manually.", "error");
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

export default function Home() {
    useEffect(() => {
        requestData(true);
    }, []);
    return (
        <>
            <Head>
            <title>{`${title} – Login`}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>
            <div className="alert">
                <span
                    className="closebtn no-select"
                    id ="closebtn"
                >
                    &times;
                </span>
                <span>Dies ist eine Benachrichtigung.</span>
            </div>
            <div style={{ display: "none" }}>
                <button
                    onClick={() => {
                        requestData();
                    }}
                    id="refreshButton"
                ></button>
                <button
                    onClick={() => {
                        alertBox("Fehler bei der WebSocket-Verbindung. Live-Aktualisierungen sind deaktiviert.", "error");
                    }}
                    id="wsError"
                ></button>
            </div>
            <div className="fullscreen center-H">
                <h1 id="textfield" >Anmelden</h1>
                 <form
                     className="nextToEachOther"
                     onSubmit={(e) => {
                         e.preventDefault();
                         requestData(false);
                     }}
                 >
                     <div className="center-H">
                         <input className="labelInputField" placeholder="Passwort" type="password" id="password" name="password" required size="20" />
                     </div>
                     
                     <input className="buttonReal" type="submit" value="Authentifizieren"></input>
                 </form>
                <div className="nextToEachOther"> 
                {/* TODO: top right corner */}
                    <button
                        className="buttonReal"
                        onClick={() => {
                            document.location.href = "./table";
                        }}
                    >
                        Buchungs-Seite
                    </button>
                    <button
                        className="buttonReal"
                        onClick={() => {
                            document.location.href = "./";
                        }}
                    >
                        Startseite
                    </button>
                </div>
            </div>
        </>
    );
}
