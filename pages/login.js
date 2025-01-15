import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

import alertBox from "../js/alertBox";
import config from "../config.json" with { type: "json" };
const metaData = config["html-meta-data"];
const title = config.settings.title;

async function requestData(autologin = false) {
    const password = document.getElementById("password")?.value || sessionStorage.getItem("password");
    await axios
        .post("/api/getAdminData", { password: password })
        .then((res) => {
            // the password is correct
            sessionStorage.setItem("password", password);
            if (autologin) {
                alertBox("You have been logged in automatically.", "success");
            } else {
                alertBox("You have been logged in.", "success");
            }

            // window.location.href = "./admin";
        })
        .catch((error) => {
            if (sessionStorage.getItem("password") && error?.response?.data.code === 401) {
                // wrong autologin password
                sessionStorage.removeItem("password");
                alertBox("Autologin failed due to an invalid password. Please enter it manually.", "error");
                return;
            }
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

export default function Home() {
    useEffect(() => {
        const password = sessionStorage.getItem("password");
        if (!password) return;
        requestData(true);

        // inform the user when failed
        // inform also when successfull on the admin page
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
