import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

import alertBox from "../js/alertBox";
import config from "../config.json" with { type: "json" };
const metaData = config["html-meta-data"];
const title = config.settings.title;

async function requestData(autologin = false) {
    const cookieString = document.cookie;
    const cookies = Object.fromEntries(cookieString.split("; ").map(cookie => cookie.split("=")));


    const password = document.getElementById("password")?.value || cookies.password;
    await axios
        .post("/api/login", { password: password })
        .then((res) => {
            // the password is correct
            document.cookie = `password=${password}; path=/; max-age=` + 60 * 60 * 24 * 7 + ";"; // Cookie valid for 1 week
            if (autologin) {
                alertBox("You have been logged in automatically.", "success");
            } else {
                alertBox("Logged in.", "success");
            }

            // window.location.href = "./admin";
        })
        .catch((error) => {
            if (error?.response?.data.code === 401) document.cookie = "password=; Path=/; Max-Age=0;";
            if (autologin) return alertBox("Autologin failed due to an invalid password. Please enter it manually.", "error");

            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

export default function Home() {
    useEffect(() => {
        const cookieString = document.cookie;
        const cookies = Object.fromEntries(cookieString.split("; ").map(cookie => cookie.split("=")));

        const password = cookies.password;
        if (!password) return;
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
                    onClick={() => {
                        document.getElementsByClassName("alert")[0].classList = "alert";
                    }}
                >
                    &times;
                </span>
                <span>This is an alert box.</span>
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
                        alertBox("The websocket connection failed. Live updates are disabled.", "error", 5000);
                    }}
                    id="wsError"
                ></button>
            </div>
            <div className="fullscreen center-H">
                <h1 id="textfield" >Identify yourself</h1>
                 <form
                     className="nextToEachOther"
                     onSubmit={(e) => {
                         e.preventDefault();
                         requestData(false);
                     }}
                 >
                     <div className="center-H">
                         <label htmlFor="name">Password: </label>
                         <input type="password" id="password" name="password" required size="20" />
                     </div>

                     <input className="buttonReal" type="submit" value="Authenticate"></input>
                 </form>
                <div className="nextToEachOther"> 
                {/* TODO: top right corner */}
                    <button
                        className="buttonReal"
                        onClick={() => {
                            document.location.href = "./table";
                        }}
                    >
                        Booking panel
                    </button>
                    <button
                        className="buttonReal"
                        onClick={() => {
                            document.location.href = "./";
                        }}
                    >
                        Home
                    </button>
                </div>
            </div>
        </>
    );
}
