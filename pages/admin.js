import React, { useEffect, useState } from "react";
import Head from "next/head";
import cookie from "cookie";
import axios from "axios";

import alertBox from "../js/alertBox";
import passwords from "../passwords.json" with { type: "json" };
import config from "../config.json" with { type: "json" };
import table from "../data/table.json" with { type: "json" };

const metaData = config["html-meta-data"];
const slotsPerColumn = config.settings.slotsPerColumn;
const title = config.settings.title;
const adminkey = passwords.adminkey;

// functions
import cbmode from "../js/cbmode.js";

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
        props: {}
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

function markBookedSlots(setUpdated, reason) {
    // get number of booked slots for each time slot
    axios
        .get("/api/getBookings")
        .then((response) => {
            // color the booked slots
            const slots = response.data.message.data;

            Object.keys(slots).forEach((key) => {
                for (let i = 0; i < slots[key]; i++) {
                    const index = Object.keys(slots).indexOf(key);
                    document.getElementById(`${index}_${i}`).classList.add("booked");
                }
            });

            setUpdated("Last update: " + new Date(response.data.message.updated).toLocaleString());
            cbmode();
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

export default function Home() {
    const [updated, setUpdated] = useState("Fetching data...");

    useEffect(() => {
        markBookedSlots(setUpdated, "first");
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
            <p style={{ display: "none" }} id="firstLoad">true</p>
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
                    markBookedSlots(setUpdated, "websocket");
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
                            <th className="header" key={`${time}`} id={index}>
                                {time}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(slotsPerColumn)].map((_, rowIndex) => (
                        <tr key={`row_${rowIndex}`}>
                            {Object.keys(table.data).map((element, colIndex) => (
                                <td
                                    className="slot"
                                    onClick={() => {
                                        // TODO: trigger window
                                        cbmode();
                                    }}
                                    key={`${rowIndex}_${colIndex}`}
                                    id={`${colIndex}_${rowIndex}`}
                                    title="Click to manage"
                                >
                                    {rowIndex + 1}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <br></br>
            <div className="center-H nextToEachOther">
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
        </>
    );
}
