import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

import tableHeaders from "../js/tableHeaders.js";
const config = require("../config.json");
const { slotsPerColumn } = config.settings;
const { checks } = config.settings;
const metaData = config["html-meta-data"];

/**
 * Display an alert box
 * @param {String} message The message to display
 * @param {String} type The type of the message
 * @param {Number} time The time in ms to display the message
 */
const alertBox = (message, type, time) => {
    const notification = document.getElementsByClassName("alert")[0];
    notification.childNodes[1].innerText = message;
    notification.classList = `alert ${type} visible`;

    if (time) {
        setTimeout(() => {
            notification.classList = "alert";
        }, time);
    } // TODO: make the text fade out before the notification
    // TODO: fix the spam timeout
};

/**
 * Request the server to book the selected slots
 * @param {Function} setUpdated The function to set the updated time
 */
const bookSlots = (setUpdated) => {
    // send the data to the server and handle the response
    const firstname = document.getElementById("firstname").value.replace(/\s+/g, "");
    const lastname = document.getElementById("lastname").value.replace(/\s+/g, "");
    const email = document.getElementById("email").value.replace(/\s+/g, "");

    // // transform the slots into an array of strings of their id
    const slotsArr = Array.from(document.getElementsByClassName("clicked")).map((slot) => slot.id);

    if (slotsArr.length === 0) return alertBox("Please select at least one slot", "info", 3000);

    // // slots can only be booked in one column
    const firstColumn = slotsArr[0]?.split("_")[0] || "0";
    for (let i = 1; i < slotsArr.length; i++) {
        if (slotsArr[i].split("_")[0] !== firstColumn) return alertBox("You can only book slots in one column", "info", 3000);
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
            setUpdated("Last update: " + new Date(response.data.message.updated).toLocaleString());
            document.getElementById("checkUserBookings")?.click(); //TODO: explain the color of the slots
            alertBox("Booking successful!", "success", 3000);
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
};

/**
 * Request the server to mark the booked slots
 * @param {Function} setUpdated The function to set the updated time
 * @param {String} reason The reason for the requested update
 */
const markBookedSlots = (setUpdated, reason) => {
    // get number of booked slots for each time slot
    axios
        .get("/api/getBookings")
        .then((response) => {
            // remove all clicked or booke slots
            if (reason == "client") {
                // only remove the clicked slots if the client booked a slot
                const clickedSlots = document.getElementsByClassName("clicked");
                while (clickedSlots.length > 0) {
                    clickedSlots[0].classList.remove("clicked");
                }

                const bookedSlots = document.getElementsByClassName("booked");
                while (bookedSlots.length > 0) {
                    bookedSlots[0].classList.remove("booked");
                }
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
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
};

/**
 * Request the server to return the booked slots for the client
 */
const checkBookedSlots = () => {
    axios
        .post("/api/getUserBookings", {
            firstname: document.getElementById("firstname").value.replace(/\s+/g, ""),
            lastname: document.getElementById("lastname").value.replace(/\s+/g, ""),
            email: document.getElementById("email").value.replace(/\s+/g, ""),
        })
        .then((response) => {
            document.getElementById("clearSelection").click(); // clear the selection
            const { bookedSlots } = response.data.message;

            if (bookedSlots.length === 0) return alertBox("You have not booked any slots", "info", 3000);

            // remove all clicked slots
            const clickedSlots = document.getElementsByClassName("clicked");
            while (clickedSlots.length > 0) {
                clickedSlots[0].classList.remove("clicked");
            }

            // remove all bookedByClient slots
            const bookedByClientSlots = document.getElementsByClassName("bookedByClient");
            while (bookedByClientSlots.length > 0) {
                bookedByClientSlots[0].classList.remove("bookedByClient");
            }

            // color the booked slots
            // [["18:00", 2], ["19:00", 1]]
            bookedSlots.forEach((slot) => {
                // find the header with the time
                const headers = document.getElementsByClassName("header");
                const header = Array.from(headers).find((header) => header.textContent === slot[0]);

                // color the slots
                for (let i = 0; i < slot[1]; i++) {
                    document.getElementById(`${header.id}_${i}`).classList.add("bookedByClient");
                    document.getElementById(`${header.id}_${i}`).style.cursor = "not-allowed";
                    document.getElementById(`${header.id}_${i}`).title = "Your booking";
                }
            });
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
};

const TimeTable = () => {
    const [updated, setUpdated] = useState("Fetching data...");

    // Generate the times for the table headers
    const times = tableHeaders();

    useEffect(() => {
        markBookedSlots(setUpdated, "first");
    }, []);

    return (
        <>
            <Head>
                <title>astro-booking-system - schedule</title>
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
                        onClick={() => {
                            document.getElementsByClassName("alert")[0].classList = "alert";
                        }}
                    >
                        &times;
                    </span>
                    <span>This is an alert box.</span>
                </div>
                <p style={{ display: "none" }} id="var"></p>
                <h1 className="scheduleHeader">Time Table - {updated}
                        <button
                          className="scheduleHeaderButton"
                         onClick={() => {
                                document.location.href = "./admin";
                            }}
                        >
                            Admin panel
                        </button>
                        <button
                            className="scheduleHeaderButton"
                            onClick={() => {
                                document.location.href = ".";
                            }}
                        >
                            Home
                        </button>
                </h1>
                
                <button //TODO: so somethign against brute forcing
                    style={{ display: "none" }}
                    onClick={() => {
                        markBookedSlots(setUpdated, "websocket");
                    }}
                    id="refreshButton"
                ></button>
                <button
                    style={{ display: "none" }}
                    onClick={() => {
                        alertBox("Websocket connection failed. Live updates are disabled.", "error", 5000);
                    }}
                    id="wsError"
                ></button>
                <table className="schedule">
                    <thead>
                        <tr>
                            {times.map((time, index) => (
                                <th
                                    className="header"
                                    key={`${time}`} // Added a unique key
                                    id={index}
                                >
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
                                        onClick={() => {
                                            if (document.getElementById(`${colIndex}_${rowIndex}`).classList.contains("booked")) return;
                                            document.getElementById(`${colIndex}_${rowIndex}`).classList.toggle("clicked");
                                        }}
                                        key={`${rowIndex}_${colIndex}`}
                                        id={`${colIndex}_${rowIndex}`}
                                        title="Click to select"
                                    >
                                        {colIndex} {rowIndex}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                    <label htmlFor="name">Firstname:</label>
                    <input type="text" id="firstname" name="firstname" required minLength="2" maxLength={checks.firstname} size="10" />

                    <label htmlFor="name">Lastname:</label>
                    <input type="text" id="lastname" name="lastname" required minLength="2" maxLength={checks.lastname} size="10" />

                    <label htmlFor="name">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
                        size="30"
                        required
                    />

                    <div className="nextToEachOther">
                        <input
                            type="submit"
                            value="Book"
                            className="buttonReal"
                            onClick={() => {
                                document.getElementById("var").textContent = "book";
                            }}
                        ></input>
                        <input
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

                                const bookedByClientSlots = document.getElementsByClassName("bookedByClient");
                                while (bookedByClientSlots.length > 0) {
                                    bookedByClientSlots[0].title = "Already booked";
                                    bookedByClientSlots[0].classList.remove("bookedByClient");
                                }
                            }}
                        >
                            Clear selection
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TimeTable;
