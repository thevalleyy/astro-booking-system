// packages
import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

// files
import headers from "../data/headers.json" with { type: "json" };
import alertBox from "../js/alertBox.js";
import config from "../config.json" with { type: "json" };

// variables
const { slotsPerColumn } = config.settings;
const { checks } = config.settings;
const metaData = config["html-meta-data"];
const title = config.settings.title;

// functions
import cbmode from "../js/cbmode.js";

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

function bookSlots(setUpdated) {
    bookAnimation("start");

    // send the data to the server and handle the response
    const firstname = document.getElementById("firstname").value.replace(/\s+/g, "");
    const lastname = document.getElementById("lastname").value.replace(/\s+/g, "");
    const email = document.getElementById("email").value.replace(/\s+/g, "");

    // transform the slots into an array of strings of their id
    const slotsArr = Array.from(document.getElementsByClassName("clicked")).map((slot) => slot.id);

    if (slotsArr.length === 0) {
        alertBox("Please select at least one slot", "info", 3000);
        bookAnimation("stop");
        return;
    }

    // slots can only be booked in one column
    const firstColumn = slotsArr[0].split("_")[0] || "0";
    for (let i = 1; i < slotsArr.length; i++) {
        if (slotsArr[i].split("_")[0] !== firstColumn) {
            alertBox("You can only book slots in one column", "info", 3000);
            bookAnimation("stop");
            return;
        }
    }

    // get the time slot
    const timeSlot = document.getElementById(firstColumn).textContent;

    // send the data to the server and handle the response
    axios
        .post("/api/addEntry", {
            firstname,
            lastname,
            email,
            bookedSlots: slotsArr.length,
            timeSlot: timeSlot,
        })
        .then((response) => {
            bookAnimation("stop");
            alertBox(response.data.message, "success", 10000);
            setUpdated("Last update: " + new Date(response.data.updated).toLocaleString());

            markBookedSlots(setUpdated, "client");
            document.getElementById("checkUserBookings")?.click();

            // write name, lastname and email to local storage
            localStorage.setItem("firstname", firstname);
            localStorage.setItem("lastname", lastname);
            localStorage.setItem("email", email);
            // on page load, fill the input fields with the values from local storage
            // and checkBookedSlots()
        })
        .catch((error) => {
            if (error?.response?.data.updated) setUpdated("Last update: " + new Date(error.response.data.updated).toLocaleString());
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
            bookAnimation("stop");
        });
}

function markBookedSlots(setUpdated, reason) {
    if (reason == "websocket" && (!document.getElementById("book").value.includes("disabled") && document.getElementById("book").disabled)) return;
    if (reason == "websocket") checkBookedSlots(false);
    // do not update if the book button is disabled, because the client will update the slots after the booking

    // get number of booked slots for each time slot
    axios
        .get("/api/getBookings")
        .then((response) => {
            if (reason == "client") { // the client has booked some slots
                const clickedSlots = document.getElementsByClassName("clicked");
                while (clickedSlots.length > 0) {
                    clickedSlots[0].classList.remove("clicked");
                }
            }

            const bookedSlots = document.getElementsByClassName("booked");
            while (bookedSlots.length > 0) {
                bookedSlots[0].classList.remove("booked");
            }

            // color the booked slots
            const slots = response.data.message.data;
            let clickedSlotsWereBooked = false;

            Object.keys(slots).forEach((key) => {
                for (let i = 0; i < slots[key]; i++) {
                    const index = Object.keys(slots).indexOf(key);
                    document.getElementById(`${index}_${i}`).classList.add("booked");
                    document.getElementById(`${index}_${i}`).style.cursor = "not-allowed";
                    document.getElementById(`${index}_${i}`).title = "Already booked";
                    if (document.getElementById(`${index}_${i}`).classList.contains("clicked")) {
                        document.getElementById(`${index}_${i}`).classList.remove("clicked");
                        clickedSlotsWereBooked = true;
                    }
                }
            });

            setUpdated("Last update: " + new Date(response.data.message.updated).toLocaleString());
            if (clickedSlotsWereBooked) {
                alertBox("Some of the slots you selected are no longer available. Please select other slots.", "info", 5000);
            }

            cbmode();
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

function checkBookedSlots(runRefresh = true) {
    if (runRefresh) document.getElementById("refreshButton").click();

    // write the new values for firstname, lastname and email to local storage
    localStorage.setItem("firstname", document.getElementById("firstname").value.replace(/\s+/g, ""));
    localStorage.setItem("lastname", document.getElementById("lastname").value.replace(/\s+/g, ""));
    localStorage.setItem("email", document.getElementById("email").value.replace(/\s+/g, ""));

    axios
        .post("/api/getUserBookings", {
            firstname: localStorage.getItem("firstname") || document.getElementById("firstname").value.replace(/\s+/g, ""),
            lastname: localStorage.getItem("lastname") || document.getElementById("lastname").value.replace(/\s+/g, ""),
            email: localStorage.getItem("email") || document.getElementById("email").value.replace(/\s+/g, ""),
        })
        .then((response) => {
            document.getElementById("clearSelection").click();
            const { bookedSlots } = response.data.message;

            // remove all bookedByClient slots
            const bookedByClientSlots = document.getElementsByClassName("bookedByClient");
            while (bookedByClientSlots.length > 0) {
                bookedByClientSlots[0].classList.remove("bookedByClient");
            }

            if (bookedSlots.length === 0) {
                // Use the performance API to check if the page was reloaded
                if (document.getElementById("firstload").textContent === "true") alertBox("You have not booked any slots yet", "info", 3000);
                document.getElementById("firstload").textContent = "false";
                return;
            }
            
            

            // remove all clicked slots
            const clickedSlots = document.getElementsByClassName("clicked");
            while (clickedSlots.length > 0) {
                clickedSlots[0].classList.remove("clicked");
            }

            // color the booked slots
            // ["18:00", 2] -> the api will return only one array

            // find the header with the time
            const headers = document.getElementsByClassName("header");
            const header = Array.from(headers).find((header) => header.textContent === bookedSlots[0]);

            // color the slots
            for (let i = 0; i < bookedSlots[1]; i++) {
                document.getElementById(`${header.id}_${i}`).classList.remove("booked");
                document.getElementById(`${header.id}_${i}`).classList.add("bookedByClient");
                document.getElementById(`${header.id}_${i}`).style.cursor = "not-allowed";
                document.getElementById(`${header.id}_${i}`).title = "Your booking";
            }

            cbmode();
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

async function getState(setEnabled) {
    try {
        await axios
            .get("/api/getState")
            .then((res) => {
                const state = res.data.enabled;
                setEnabled(state);

                // give all slots the disabled class
                if (!state) {
                    const slots = document.getElementsByClassName("slot");
                    for (let i = 0; i < slots.length; i++) {
                        slots[i].classList.remove("clicked");
                        slots[i].classList.add("disabled");
                    }
                }
                
            })
            .catch((error) => {
                console.log(error);
                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                return;
            });
    } catch (error) {
        console.error(error);
        alertBox("Error getting state. See console for more information", "error");
    }
}

export default function TimeTable() {
    const [updated, setUpdated] = useState("Fetching data...");
    const [enabled, setEnabled] = useState(true);

    // Generate the times for the table headers
    const times = headers;

    useEffect(() => {
        markBookedSlots(setUpdated, "first");
        getState(setEnabled);

        document.getElementById("cbmode").addEventListener("click", function () {
            cbmode();
        });

        if (document.getElementById("email")) {
            // the has booked some slots before, so fill in their information
            // and check their booked slots
            document.getElementById("firstname").value = localStorage.getItem("firstname") || "";
            document.getElementById("lastname").value = localStorage.getItem("lastname") || "";
            document.getElementById("email").value = localStorage.getItem("email") || "";
            document.getElementById("checkUserBookings").click();
        }
    }, []);

    return (
        <>
            <Head>
                <title>{`${title} – Time Schedule`}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>
            <div>
                <div className="alert">
                    <span
                        className="closebtn no-select"
                        id ="closebtn"
                    >
                        &times;
                    </span>
                    <span>This is an alert box.</span>
                </div>
                <p style={{ display: "none" }} id="var"></p>
                <p style={{ display: "none" }} id="firstload">true</p>
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
                            document.location.href = "./login";
                        }}
                    >
                        Admin panel
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
                        alertBox("Websocket connection failed. Live updates are disabled.", "error");
                    }}
                    id="wsError"
                ></button>
                <table className="schedule no-select">
                    <thead>
                        <tr>
                            {times.map((time, index) => (
                                <th className="header" key={`${time}`} id={index}>
                                    {time}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(slotsPerColumn)].map((_, rowIndex) => (
                            <tr key={`row_${rowIndex}`}>
                            {times.map((element, colIndex) => (
                                <td
                                className="slot"
                                    {...(enabled ? {
                                        // booking is enabled
                                        onClick: () => {
                                            if (document.getElementById(`${colIndex}_${rowIndex}`).classList.contains("booked")) return;
                                            if (document.getElementById(`${colIndex}_${rowIndex}`).classList.contains("bookedByUser")) return;
                                            document.getElementById(`${colIndex}_${rowIndex}`).classList.toggle("clicked");
                                            cbmode();
                                        },
                                        title: "Click to select",

                                    } : {
                                        // booking is disabled
                                        onClick: () => {
                                            alertBox("Booking is currently disabled", "info", 3000);
                                        },
                                        title: "Booking is disabled",
                                        style: { cursor: "not-allowed" }
                                    })}
                                    key={`${rowIndex}_${colIndex}`}
                                    id={`${colIndex}_${rowIndex}`}
                                >
                                    {rowIndex + 1}
                                </td>
                            ))}
                        </tr>
                        
                        ))}
                    </tbody>
                </table>
                <div className="nextToEachOther" style={{ alignItems: "baseline", float: "left" }}>
                    <div className="settingsElement">
                        <h3 className="center-H">Legend</h3>
                        <br></br>
                        <div className="legend no-select center-H">
                            <table>
                                <tbody>
                                    <tr>
                                        <td style={{ opacity: 0 }}></td>
                                        <td>
                                            <p className="slotColor">Empty slot</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ opacity: 0 }}>🎯</td>
                                        <td>
                                            <p className="clickedColor">Selected by you</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ opacity: 0 }}>✨</td>
                                        <td>
                                            <p className="bookedByClientColor">Booked by you</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ opacity: 0 }}>⚠️</td>
                                        <td>
                                            <p className="bookedColor">Booked by someone else</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="settingsElement">
                        <h3 className="center-H">Colorblind mode</h3>
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
                    </div>
                </div>
                <form
                    className="center-H"
                    onSubmit={(e) => {
                        e.preventDefault();
                        switch (document.getElementById("var").textContent) {
                            case "book":
                                bookSlots(setUpdated);
                                break;
                            case "check":
                                checkBookedSlots();
                                break;
                            default:
                                break;
                        }
                    }}
                >
                    <div className="nextToEachOther" style={{ alignItems: "baseline", paddingLeft: "20vw" }}>
                        <div className="settingsElement">
                            <h3 className="center-H">Input your data</h3>
                            <br style={{ margin: 0, padding: 0 }}></br>
                            <div>
                                <input
                                    className="labelInputField"
                                    placeholder="Firstname"
                                    type="text"
                                    id="firstname"
                                    name="firstname"
                                    required
                                    minLength="2"
                                    maxLength={checks.firstname}
                                    size="30"
                                />
                            </div>
                            <div>
                                <input
                                    className="labelInputField"
                                    placeholder="Lastname"
                                    type="text"
                                    id="lastname"
                                    name="lastname"
                                    required
                                    minLength="2"
                                    maxLength={checks.lastname}
                                    size="30"
                                />
                            </div>
                            <div>
                                <input
                                    className="labelInputField"
                                    placeholder="Email Address"
                                    type="email"
                                    id="email"
                                    name="email"
                                    pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
                                    size="30"
                                    required
                                />
                            </div>
                            <input
                                {...(enabled ? {
                                    // booking is enabled
                                    value: "Book",
                                    disabled: false
                                } : { 
                                    // booking is disabled
                                    style: { cursor: "not-allowed" },
                                    value: "Booking is disabled",
                                    disabled: true
                                })}

                                id="book"
                                type="submit"
                                className="buttonReal"
                                onClick={() => {
                                    document.getElementById("var").textContent = "book";
                                }}
                            ></input>
                        </div>

                        <div className="center-H settingsElement">
                            <br style={{ margin: 0, padding: 0 }}></br>
                            <input
                                // style={{ display: "none" }}
                                /**
                                 * this button might aswell be displayed, but it could confuse the user
                                 * it will request the api (getUserBookings) and color the slots that the user has booked
                                 * however, this is already done on page load
                                 * if you want to display it, remove the style attribute
                                 **/

                                type="submit"
                                id="checkUserBookings"
                                value="Check booked slots"
                                className="buttonReal"
                                onClick={() => {
                                    document.getElementById("var").textContent = "check";
                                }}
                            ></input>
                            <button
                                type="button"
                                id="clearSelection"
                                className="buttonReal"
                                onClick={() => {
                                    const clickedSlots = document.getElementsByClassName("clicked");
                                    while (clickedSlots.length > 0) {
                                        clickedSlots[0].classList.remove("clicked");
                                    }

                                    cbmode();
                                }}
                            >
                                Clear selection
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
