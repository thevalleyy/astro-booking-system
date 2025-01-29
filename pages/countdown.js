import React, { useEffect, useState } from "react";
import Head from "next/head";
import cookie from "cookie";

import passwords from "../passwords.json" with { type: "json" };
import config from "../config.json" with { type: "json" };
import headers from "../data/headers.json" with { type: "json" };

const metaData = config["html-meta-data"];
const slotsPerColumn = config.settings.slotsPerColumn;
const title = config.settings.title;
const adminkey = passwords.adminkey;

// functions
import alertBox from "../js/alertBox";

export async function getServerSideProps(context) {
    const { req, res } = context;
    const cookies = cookie.parse(req.headers.cookie || "");
    const password = cookies.password || "";

    if (!password || password !== adminkey) {
        // invalid password
        res.setHeader(
            "Set-Cookie",
            cookie.serialize("password", "", {
                path: "/",
                expires: new Date(0),
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
        );

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

function informNewData() {
    alertBox("New data available, refresh to apply", "info");
}

function updateTime() {
    const time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();

    // padding
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    document.getElementById("time").innerText = `${hours}:${minutes}:${seconds}`;
}

function startEvent() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("event").style.display = "block";

    // update time
    updateTime();
    setInterval(() => {
        updateTime();
    }, 1000);

    // determine the nearest timeframe

}

export default function Home() {
    const times = headers;

    useEffect(() => {
        // portrait mode warning
        if (window.innerHeight > window.innerWidth) {
            alertBox("Please use landscape mode for better experience", "error");
        }

        window.addEventListener("resize", () => {
            console.log("fullscreenchange");
            if (window.innerHeight !== window.screen.height) {
                // make buttons visible
                document.getElementsByClassName("scheduleHeader")[0].style.display = "block";
            } else {
                // hide buttons
                document.getElementsByClassName("scheduleHeader")[0].style.display = "none";
            }
        });

    }, []);
    return (
        <>
            <Head>
                <title>{`${title} – Countdown`}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>

            <button
                style={{ display: "none" }}
                onClick={() => {
                    informNewData();
                }}
                id="refreshButton"
            ></button>
            <button
                style={{ display: "none" }}
                onClick={() => {
                    // do nothing
                }}
                id="wsError"
            ></button>

            <div className="alert">
                <span className="closebtn no-select" id="closebtn">
                    &times;
                </span>
                <span>This is an alert box.</span>
            </div>

            <h1 className="scheduleHeader">
                <button
                    className="scheduleHeaderButton"
                    onClick={() => {
                        document.location.href = ".";
                    }}
                >
                    Home
                </button>
                <button
                    className="scheduleHeaderButton"
                    onClick={() => {
                        document.location.href = "./table";
                    }}
                >
                    Booking Panel
                </button>
                <button
                    className="scheduleHeaderButton"
                    onClick={() => {
                        document.location.href = "./admin";
                    }}
                >
                    Admin Panel
                </button>
            </h1>

            <div className="center-H" id="startButton">
                <label style={{cursor: "pointer"}} onClick={() => {document.getElementById("forcestart").click()}}>Forced start at the first timeslot ({headers[0]}). If {headers[0]} has already passed today, the event will not start until tomorrow.</label>
                <input type="checkbox" id="forcestart" style={{cursor: "pointer"}}></input>
                <br></br>
                <button className="buttonReal" onClick={() => {startEvent()}}>Start</button>
            </div>

            <div id="event" style={{display: "none"}}>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <div className="center-H">
                    <h1>Event started!</h1>
                    <h2 id="time">...</h2>
                    <br></br>
                    <h2>Current Timeframe:</h2>
                    <h2>Next Timeframe:</h2>
                </div>
            </div>
        </>
    );
}
