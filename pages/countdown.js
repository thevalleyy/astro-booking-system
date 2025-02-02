import React, { useEffect, useState } from "react";
import Head from "next/head";
import cookie from "cookie";

import passwords from "../passwords.json" with { type: "json" };
import config from "../config.json" with { type: "json" };
import headers from "../data/headers.json" with { type: "json" };
import table from "../data/table.json" with { type: "json" };

const metaData = config["html-meta-data"];
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
    alertBox("Neue Daten verfügbar, neu laden zum Aktualisieren", "info");
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

function evaluateCurrentTimeframe(timeframes) {
    const time = new Date();
    const currentTime = time.getTime();

    if (currentTime > Number.parseInt(timeframes[timeframes.length - 1])) {
        // all timeframes have already passed
        return headers.length;
    }

    let curr = 0;

    for (let i = 0; i < timeframes.length; i++) {
        if (Number.parseInt(timeframes[i]) > currentTime) {
            // found next timeframe
            curr = i;
            break;
        }
    }

    return curr - 1;
}

function startEvent() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("event").style.display = "block";

    // update time
    updateTime();
    setInterval(() => {
        updateTime();
    }, 1000);

    // get forced start
    const forceFirst = document.getElementById("forcestart").checked;
    
    // calculate all time frames
    const timeframes = [];
    let firstSlotAlreadyPassed = false;

    for (let i = 0; i < headers.length; i++) {
        const time = headers[i].split(":");
        const hours = parseInt(time[0]);
        const minutes = parseInt(time[1]);

        let timeFrame = new Date();
        timeFrame.setHours(hours);
        timeFrame.setMinutes(minutes);
        timeFrame.setSeconds(0);
        timeFrame.setMilliseconds(0);

        if (headers[i - 1] && headers[i - 1].split(":")[0] > hours) {
            // new day
            timeFrame.setDate(timeFrame.getDate() + 1);
        }

        if (forceFirst) {
            // check if the time has already passed today
            if (timeFrame < new Date() || firstSlotAlreadyPassed) {
                // add 1 day
                timeFrame.setDate(timeFrame.getDate() + 1);

                firstSlotAlreadyPassed = true;
            }
        }

        timeframes.push(timeFrame.getTime().toString());
    }


    function update() {
        // evaluate the current timeframe
        const current = evaluateCurrentTimeframe(timeframes);
        // console.log(timeframes, current, new Date(Number.parseInt(timeframes[0])));

        // update the current timeframe
        if (current < 0) {
            document.getElementById("curr").innerText = "Keiner";
            document.getElementById("next").innerText = headers[0];
        } else if (current == headers.length) {
            document.getElementById("curr").innerText = headers[headers.length - 1];
            document.getElementById("next").innerText = "Keiner";
        } else {
            document.getElementById("curr").innerText = headers[current];
            document.getElementById("next").innerText = headers[current + 1];
        }
    }

    update();
    setInterval(() => {
        update();
    }, 1000);

    // update time remaining
    function updateTimeRemaining() {
        const current = evaluateCurrentTimeframe(timeframes);
        const time = new Date();
        const currentTime = time.getTime();

        if (current < 0) {
            // no current timeframe
            const nextTime = Number.parseInt(timeframes[current + 1]);
            const timeRemaining = nextTime - currentTime;

            const hours = Math.floor(timeRemaining / 3600000);
            const minutes = Math.floor((timeRemaining % 3600000) / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);

            document.getElementById("timeRem").innerText = `${hours ? hours + "h" : ""} ${minutes}m ${seconds}s`;
        } else if (current == headers.length) {
            // all timeframes have already passed
            document.getElementById("timeRem").innerText = "...";

        } else {
            const nextTime = Number.parseInt(timeframes[current + 1]);
            const timeRemaining = nextTime - currentTime;

            const hours = Math.floor(timeRemaining / 3600000);
            const minutes = Math.floor((timeRemaining % 3600000) / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);

            document.getElementById("timeRem").innerText = `${hours ? hours + "h" : ""} ${minutes}m ${seconds}s`;
        }
    }

    updateTimeRemaining();
    setInterval(() => {
        updateTimeRemaining();
    }, 1000);

    function fillBookings(index, element) {
        const timeslot = table.data[Object.keys(table.data)[index]];
        let sum = 0;
        let tableHTML = `<table style="width: 100%; border-collapse: collapse;">`;
    
        // Kopfzeile (optional, falls du Spaltenüberschriften möchtest)
        tableHTML += `
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ccc;">Name</th>
            <th style="text-align: right; border-bottom: 1px solid #ccc;">Slots</th>
          </tr>
        `;
    
        // Zeilen für jede Buchung
        for (let i = 0; i < Object.keys(timeslot).length; i++) {
            const booking = timeslot[i];
            sum += booking.bookedSlots;
            tableHTML += `
              <tr>
                <td style="padding: 5px 0; text-align: left;">${booking.firstname.substring(0, 1).toUpperCase()}. ${booking.lastname}</td>
                <td style="padding: 5px 0; text-align: right;">${booking.bookedSlots}</td>
              </tr>
            `;
        }
    
        // Falls keine Slots gebucht wurden
        if (sum === 0) {
            tableHTML = "<h3>Keine!</h3>";
        } else {
            // Zeile für die Summe
            tableHTML += `
                <tr>
                    <td colspan="2">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; text-align: left;">Insgesamt</td>
                  <td style="padding-top: 10px; text-align: right; font-weight: bold;">${sum}</td>
                </tr>
            `;
        }
    
        tableHTML += "</table>";
    
        element.innerHTML = tableHTML;
    }
    
    

    function updateBookings() {
        const current = evaluateCurrentTimeframe(timeframes);
        if (current < 0) {
            // no current timeframe
            document.getElementById("currSlots").innerText = "Keine";
            fillBookings(0, document.getElementById("nextSlots"));
        } else if (current == headers.length) {
            // all timeframes have already passed
            fillBookings(headers.length - 1, document.getElementById("currSlots"));
            document.getElementById("nextSlots").innerText = "Keine";
        } else {
            fillBookings(current, document.getElementById("currSlots"));
            fillBookings(current + 1, document.getElementById("nextSlots"));
        }
    }

    updateBookings();
    setInterval(() => {
        updateBookings();
    }, 1000);
}

export default function Home() {
    useEffect(() => {
        // portrait mode warning
        if (window.innerHeight > window.innerWidth) {
            alertBox("Bitte im Querformat verwenden", "error");
        }

        window.addEventListener("resize", () => {
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
                <span>Dies ist eine Benachrichtigung.</span>
            </div>

            <h1 className="scheduleHeader">
                <button
                    className="scheduleHeaderButton"
                    onClick={() => {
                        document.location.href = ".";
                    }}
                >
                    Startseite
                </button>
                <button
                    className="scheduleHeaderButton"
                    onClick={() => {
                        document.location.href = "./table";
                    }}
                >
                    Buchungs-Seite
                </button>
                <button
                    className="scheduleHeaderButton"
                    onClick={() => {
                        document.location.href = "./admin";
                    }}
                >
                    Admin-Panel
                </button>
            </h1>

            <div className="center-H no-select" id="startButton">
                <label style={{cursor: "pointer"}} onClick={() => {document.getElementById("forcestart").click()}}>Erzwungener Start beim ersten Timeslot ({headers[0]}). Wenn {headers[0]} heute bereits verstrichen ist, wird das Event erst morgen beginnen.</label>
                <br style={{fontSize: "0.3em"}}></br>
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
                    <h1>Event begonnen!</h1>
                    <h1 id="time">...</h1>
                    <br></br>
                    <div className="nextToEachOther" style={{width: "80vw", alignItems: "flex-start"}}>
                        <div style={{width: "30vw"}}>
                            <h1>Aktueller Timeslot:<p id="curr"></p></h1>
                            <br></br>
                            <h1 style={{paddingBottom: "10px"}}>Gebuchte Slots:</h1>
                            <h2 id="currSlots"></h2>
                        </div>
                        
                        <div style={{width: "20vw" }} className="center-H">
                            <h1><p id="timeRem"></p></h1><h2> bis zum nächsten Timeslot</h2>
                        </div>

                        <div style={{width: "30vw"}}>
                            <h1>Nächster Timeslot:<p id="next"></p></h1>
                            <br></br>
                            <h1 style={{paddingBottom: "10px"}}>Gebuchte Slots:</h1>
                            <h2 id="nextSlots"></h2>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}