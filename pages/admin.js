import { promises as fs } from "node:fs";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import cookie from "cookie";
import axios from "axios";

import passwords from "../passwords.json" with { type: "json" };
import config from "../config.json" with { type: "json" };

const metaData = config["html-meta-data"];
const slotsPerColumn = config.settings.slotsPerColumn;
const title = config.settings.title;
const adminkey = passwords.adminkey;

// functions
import cbmode from "../js/cbmode.js";
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

    // read table.json  
    const table = JSON.parse(await fs.readFile("data/table.json", "utf-8"));

    return {
        props: {table: table},
    };
}

function bookAnimation(action = "start") {
    const dotsArray = [".", "..", "...", ".."];
    const button = document.getElementById("book");
    const originalValue = button.value.replaceAll(".", "");

    if (action == "start") {
        let i = 0;
        button.disabled = true;

        window.buttonTextInterval = setInterval(() => {
            button.value = originalValue + dotsArray[i];
            i = (i + 1) % dotsArray.length;
        }, 500);
    } else {
        button.disabled = false;
        button.value = originalValue;
        clearInterval(window.buttonTextInterval);
    }
}

function markBookedSlots(table, setUpdated) {
    try {
        const booked1 = document.getElementsByClassName("booked1");
        while (booked1.length > 0) {
            booked1[0].classList.remove("booked1");
        }

        const booked2 = document.getElementsByClassName("booked2");
        while (booked2.length > 0) {
            booked2[0].classList.remove("booked2");
        }

        const timeslots = Object.keys(table.data);
        let currentState = 1;

        timeslots.forEach((timeslot) => {
            const bookings = Object.keys(table.data[timeslot]);
            bookings.forEach((booking) => {
                const index = Object.keys(table.data).indexOf(timeslot);
                let bookedSlots = table.data[timeslot][booking].bookedSlots;
                if (bookedSlots <= 0) return; // does the booking have slots booked in the first place?

                for (let i = 0; i < slotsPerColumn; i++) {
                    if (bookedSlots <= 0) break; // all slots are colored now
                    const slot = document.getElementsByTagName("tr")[i + 1].children[index];

                    if (slot.classList.contains("booked1") || slot.classList.contains("booked2")) continue;
                    slot.classList.add(`booked${currentState}`);

                    // add the timeslot and index of booking as id
                    slot.id = `${timeslot}_${booking}`;

                    bookedSlots--;
                }

                currentState = currentState == 1 ? 2 : 1; // switch booking color
            });
        });

        setUpdated("Last update: " + new Date(table.updated).toLocaleString());
    } catch (error) {
        console.error(error);
        alertBox("Error marking booked slots. See console for more information", "error");
    }
}


function action() {
    const action = document.querySelector("select").value;

}

export default function Home({table}) {
    const [updated, setUpdated] = useState("Fetching data...");

    useEffect(() => {
        document.getElementById("cbmode").addEventListener("click", function () {
            cbmode();
        });

        // trigger only if the page is loaded, not on every reload
        const navigationEntries = performance.getEntriesByType("navigation");

        if (navigationEntries.length > 0) {
            const navigationEntry = navigationEntries[0];
            if (navigationEntry.type != "reload") {
                if (document.getElementById("firstLoad").innerText == "true") {
                    alertBox("Logged in", "success", 2000);
                    document.getElementById("firstLoad").innerText = "false";
                }
            }
        }

        markBookedSlots(table, setUpdated);
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

            <p style={{ display: "none" }} id="var"></p>
            <p style={{ display: "none" }} id="firstLoad">
                true
            </p>
            <div className="center-H">
                <h1>Time Table</h1>
                <h2>{updated}</h2>
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
                        axios
                            .get("/api/logout")
                            .then((response) => {
                                if (response.data.success) {
                                    document.location.href = "./login";
                                } else {
                                    alertBox("Error logging out", "error");
                                }
                            })
                            .catch((error) => {
                                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                            });
                    }}
                >
                    Log out
                </button>
            </h1>

            <button
                style={{ display: "none" }}
                onClick={() => {
                    markBookedSlots(table, setUpdated);
                }}
                id="refreshButton"
            ></button>
            <button
                style={{ display: "none" }}
                onClick={() => {
                    alertBox("The websocket connection failed. Live updates are disabled.", "error", 5000);
                }}
                id="wsError"
            ></button>

            <table className="schedule no-select">
                <thead>
                    <tr>
                        {Object.keys(table.data).map((time, index) => (
                            <th className="header" key={`${index}`} id={time}>
                                {time}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(slotsPerColumn)].map((_, rowIndex) => (
                        <tr key={`row_${rowIndex}`}>
                            {Object.keys(table.data).map((element, colIndex) => (
                                <td className="slot" key={`${rowIndex}_${colIndex}`} id={`${colIndex}_${rowIndex}`} title="Click to manage" 
                                    onClick={(e) => {
                                        cbmode();
                                        e.currentTarget.classList.toggle("selected");
                                    }}
                                >
                                    {rowIndex + 1}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <br></br>
            <div className="nextToEachOther">
                <div className="nextToEachOther">
                    <input type="checkbox" id="cbmode"></input>
                    <h4
                        className="no-select"
                        onClick={() => {
                            document.getElementById("cbmode").click();
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        I&#39;m colorblind
                    </h4>
                </div>
                <button
                    style={{ marginRight: "10vw"}}
                    className="buttonReal"
                    onClick={() => {
                        // download table.json
                        const element = document.createElement("a");
                        const file = new Blob([JSON.stringify(table, null, 4)], { type: "text/plain" });
                        element.href = URL.createObjectURL(file);
                        element.download = `table${new Date().toISOString()}.json`;
                        document.body.appendChild(element); // Required for this to work in FireFox
                        element.click();
                    }}
                >
                    Download table.json
                </button>
                <label htmlFor="cars">Action</label>
                
                <select>
                    <option value="inspect">Inspect</option>
                    <option value="edit">Edit</option>
                    <option value="add">Add</option>
                    <option value="remove">Remove</option>
                </select>

                <button className="buttonReal" onClick={() => {action()}}>
                    Go!
                </button>
            </div>
        </>
    );
}
