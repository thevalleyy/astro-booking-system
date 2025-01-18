// packages
import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

// files
import tableHeaders from "../js/tableHeaders.js";
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
            alertBox(response.data.message, "success", 5000);
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
    if (reason == "websocket" && document.getElementById("book").disabled) return;
    // do not update if the book button is disabled, because the client will update the slots after the booking

    // get number of booked slots for each time slot
    axios
        .get("/api/getBookings")
        .then((response) => {
            if (reason == "client") {
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

            cbmode();
        })
        .catch((error) => {
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
        });
}

function checkBookedSlots() {
    axios
        .post("/api/getUserBookings", {
            firstname: document.getElementById("firstname").value.replace(/\s+/g, ""),
            lastname: document.getElementById("lastname").value.replace(/\s+/g, ""),
            email: document.getElementById("email").value.replace(/\s+/g, ""),
        })
        .then((response) => {
            document.getElementById("clearSelection").click();
            const { bookedSlots } = response.data.message;

            if (bookedSlots.length === 0) return alertBox("You have not booked any slots yet", "info", 3000);

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

export default function TimeTable() {
    const [updated, setUpdated] = useState("Fetching data...");

    // Generate the times for the table headers
    const times = tableHeaders();

    useEffect(() => {
        markBookedSlots(setUpdated, "first");
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
                        onClick={() => {
                            document.getElementsByClassName("alert")[0].classList = "alert";
                        }}
                    >
                        &times;
                    </span>
                    <span>This is an alert box.</span>
                </div>
                <p style={{ display: "none" }} id="var"></p>
                <div className="center-H">
                    <h1>Time Table</h1>
                    <h2>{updated}</h2>
                </div>
                <h1 className="scheduleHeader">
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
                        alertBox("Websocket connection failed. Live updates are disabled.", "error", 5000);
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
                                        onClick={() => {
                                            if (document.getElementById(`${colIndex}_${rowIndex}`).classList.contains("booked")) return;
                                            if (document.getElementById(`${colIndex}_${rowIndex}`).classList.contains("bookedByUser")) return;
                                            document.getElementById(`${colIndex}_${rowIndex}`).classList.toggle("clicked");
                                            cbmode();
                                        }}
                                        key={`${rowIndex}_${colIndex}`}
                                        id={`${colIndex}_${rowIndex}`}
                                        title="Click to select"
                                    >
                                        {rowIndex + 1}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="nextToEachOther">
                    <div>
                        <h3 className="center-H">Legend</h3>
                        <br></br>
                        <div className="legend no-select">
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
                    <div>
                        <h3 className="center-H">Colorblind mode</h3>
                        <br></br>
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
                        <div className="nextToEachOther">
                            <div>
                                <h3>Input your data</h3>
                                <label htmlFor="firstname">Firstname: </label>
                                <input type="text" id="firstname" name="firstname" required minLength="2" maxLength={checks.firstname} size="10" />

                                <br></br>

                                <label htmlFor="lastname">Lastname: </label>
                                <input type="text" id="lastname" name="lastname" required minLength="2" maxLength={checks.lastname} size="10" />

                                <br></br>

                                <label htmlFor="email">Email: </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
                                    size="30"
                                    required
                                />
                            </div>
                            <div className="center-H">
                                <input
                                    id="book"
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
                                            bookedByClientSlots[0].classList.add("booked");
                                            bookedByClientSlots[0].classList.remove("bookedByClient");
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
            </div>
        </>
    );
}
