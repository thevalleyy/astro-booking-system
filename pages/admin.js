import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

import alertBox from "../js/alertBox";
import passwords from "../passwords.json" with { type: "json" };
import config from "../config.json" with { type: "json" };

const metaData = config["html-meta-data"];
const maxSlots = config.settings.slotsPerColumn;
const title = config.settings.title;
const passkey = passwords.adminkey;


export async function getServerSideProps(context) {
    const { req } = context;
    console.log(req);

    const password = localStorage.getItem("password") || "";
    if (!password || password !== adminkey) {
        // invalid password
        localStorage.removeItem("password");

        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
}

export default function Home() {
    useEffect(() => {
        // TODO: display autologin when autologged in
        alertBox("Auto logged in", "info", 2000);
    }, []);
    return (
        <>
            <Head>
            <title>{`${title} – Admin`}</title>
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
            <div className="fullscreen">
                <h1 className="backToHome">
                    <button
                        className="buttonList"
                        onClick={() => {
                            document.location.href = "./table";
                        }}
                    >
                        Booking panel
                    </button>
                    <button
                        className="buttonList"
                        onClick={() => {
                            document.location.href = "./";
                        }}
                    >
                        Home
                    </button>
                </h1>
                <br></br>
                <h1 className="center-H" id="textfield">
                    Identify yourself
                </h1>
                <br></br>
                <div className="nextToEachOther">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            requestData();
                        }}
                    >
                        <label htmlFor="name">Password:</label>
                        <input type="password" id="password" name="paddword" required size="10" />

                        <input type="submit" value="Authenticate" style={{ fontSize: "2em", marginTop: "10px" }}></input>
                    </form>
                </div>
            </div>
        </>
    );
}
