import React, { useEffect, useState } from "react";
import Head from "next/head";
import cookie from "cookie";
import axios from "axios";

import passwords from "../passwords.json" with { type: "json" };
import config from "../config.json" with { type: "json" };
import headers from "../data/headers.json" with { type: "json" };

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

    return {
        props: {},
    };
}

async function markBookedSlots(setUpdated, reason) {
    if (reason == "dl") {
        try {
            await axios
                .get("/api/getAdminData")
                .then((res) => {
                    const table = res.data.message.table;
                    const blob = new Blob([JSON.stringify(table, null, 4)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "table.json" + new Date().toISOString().replace(/:/g, "-") + ".json";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                })
                .catch((error) => {
                    console.log(error);
                    alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                    return;
                });
        } catch (error) {
            console.error(error);
            alertBox("Error downloading table.json. See console for more information", "error");
        }
        return;
    }

    try {
        const booked1 = document.getElementsByClassName("booked1");
        while (booked1.length > 0) {
            booked1[0].classList.remove("booked1");
        }

        const booked2 = document.getElementsByClassName("booked2");
        while (booked2.length > 0) {
            booked2[0].classList.remove("booked2");
        }

        await axios
            .post("/api/getAdminData")
            .then((res) => {
                const table = res.data.message.table;

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
            })
            .catch((error) => {
                console.log(error);
                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                return;
            });
    } catch (error) {
        console.error(error);
        alertBox("Error marking booked slots. See console for more information", "error");
    }
}

async function switchModes() {
    try {
        await axios
            .post("/api/changeState")
            .then((res) => {
                if (res.data.success) {
                    window.location.reload();
                } else {
                    alertBox(res.data.message, "error");
                }
            })
            .catch((error) => {
                console.log(error);
                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                return;
            });
    } catch (error) {
        console.error(error);
        alertBox("Error switching modes. See console for more information", "error");
    }
}

async function getState() {
    try {
        await axios
            .get("/api/getState")
            .then((res) => {
                const state = res.data.enabled;
                if (state) {
                    document.getElementById("switchText").innerText = "Disable booking";
                    document.getElementById("switchColor").innerHTML = `<span style="color: green">Enabled</span>`;
                } else {
                    document.getElementById("switchText").innerText = "Enable booking";
                    document.getElementById("switchColor").innerHTML = `<span style="color: red">Disabled</span>`;
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

async function updateSlots() {
    console.log("Updating slots...");
}

function action() {
    const slot = document.getElementsByClassName("selected")[0];

    if (!slot) {
        alertBox("No slots selected", "info", 3000);
        return;
    }

    function getSlotInfo() {
        let type,
            timeslot,
            id = 0;

        if (slot.id.includes(":")) {
            // booked slot id=20:40_0
            type = "booked";
            timeslot = slot.id.split("_")[0];
            id = slot.id.split("_")[1];
        } else {
            // empty slot id=8_9
            type = "empty";
            timeslot = slot.id.split("_")[0];
            id = "0";
        }

        return { type, timeslot, id };
    }

    const { type, timeslot, id } = getSlotInfo();
    const modal = document.getElementById("myModal");

    if (type == "empty") {
        // open booking modal
        return;
    }

    // open booking info modal
    axios
        .get("/api/getAdminData")
        .then((res) => {
            const table = res.data.message.table;
            const booking = table.data[timeslot][id];

            if (!booking) {
                alertBox("No booking found", "error", 3000);
                return;
            }

            // create the modal content
            const modalContent = document.querySelector(".modal-content").children[1];
            modalContent.innerHTML = `
                <h2>Booking Info</h2>
                <br></br>
                <div class="table">
                    <div class="row">
                        <div class="cell header">Field</div>
                        <div class="cell header">Value</div>
                    </div>
                    <div class="row">
                        <div class="cell">Timeslot.ID</div>
                        <div class="cell">
                            <input class="modalInput disabled" type="text" value="${timeslot}.${id}" disabled />
                        </div>
                    </div>
                    <div class="row">
                        <div class="cell">First name</div>
                        <div class="cell">
                            <input class="modalInput" type="text" value="${booking.firstname}" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="cell">Last name</div>
                        <div class="cell">
                            <input class="modalInput" type="text" value="${booking.lastname}" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="cell">Slots booked</div>
                        <div class="cell">
                            <input class="modalInput" type="text" value="${booking.bookedSlots}" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="cell">Email</div>
                        <div class="cell">
                            <input class="modalInput" type="text" value="${booking.email}" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="cell">Booked at</div>
                        <div class="cell">
                            <input class="modalInput disabled" type="text" value="${new Date(booking.time).toLocaleString()}" disabled />
                        </div>
                    </div>
                </div>
                <div class="right">
                    <button class="buttonReal" style="margin-right: 1vw;"}} onClick="document.getElementById('myModal').style.display = 'none';">Close</button>
                    <button class="buttonReal" id="saveButton" onClick="document.getElementById('triggerSave').click();">Save</button>
                </div>
       `;

            
            // display the modal
            modal.style.display = "block";
            window.scrollTo(0, document.body.scrollHeight);
        })
        .catch((error) => {
            console.log(error);
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
            return;
        });
}

export default function Home() {
    const [updated, setUpdated] = useState("Fetching data...");
    const times = headers;
    let clickedAgain = false;

    useEffect(() => {
        // event listeners
        document.getElementById("cbmode").addEventListener("click", function () {
            cbmode();
        });

        const modal = document.getElementById("myModal");
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };

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

        // functions
        getState();
        markBookedSlots(setUpdated);
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
            <div id="myModal" class="modal">
                <div class="modal-content">
                    <span
                        class="close"
                        onClick={() => {
                            document.getElementById("myModal").style.display = "none";
                        }}
                    >
                        &times;
                    </span>
                    <p>Some text in the Modal..</p>
                </div>
            </div>

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
                    markBookedSlots(setUpdated);
                }}
                id="refreshButton"
            ></button>
            <button
                style={{ display: "none" }}
                onClick={() => {
                    alertBox("The websocket connection failed. Live updates are disabled.", "error");
                }}
                id="wsError"
            ></button>
            <button
                style={{ display: "none" }}
                onClick={() => {
                    updateSlots();
                }}
                id="triggerSave"
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
                                    key={`${rowIndex}_${colIndex}`}
                                    id={`${colIndex}_${rowIndex}`}
                                    title="Click to manage"
                                    onClick={(e) => {
                                        cbmode();
                                        // remove selected class from all slots
                                        const slots = document.getElementsByClassName("slot");
                                        const selected = e.currentTarget.classList.contains("selected");
                                        for (let slot of slots) {
                                            slot.classList.remove("selected");
                                        }
                                        selected ? e.currentTarget.classList.remove("selected") : e.currentTarget.classList.add("selected");
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
                    style={{ marginRight: "2vw" }}
                    className="buttonReal"
                    onClick={() => {
                        markBookedSlots(setUpdated, "dl");
                    }}
                >
                    Download table.json
                </button>
                <div style={{ marginRight: "2vw" }}>
                    <div className="nextToEachOther">
                        <input
                            className="switch"
                            id="switch"
                            type="checkbox"
                            onClick={() => {
                                document.getElementById("switch").checked = false;
                                if (clickedAgain) {
                                    switchModes();
                                } else {
                                    alertBox("Are you sure you want to switch modes? If yes, click the button again within 5 seconds.", "info", 5000);
                                    clickedAgain = true;
                                    setTimeout(() => {
                                        clickedAgain = false;
                                    }, 5000);
                                }
                            }}
                        ></input>
                        <h4
                            className="no-select"
                            id="switchText"
                            onClick={() => {
                                document.getElementById("switch").click();
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            {/* Text will be set by getState() */}
                        </h4>
                    </div>
                    <h4>
                        Current State: <span id="switchColor">{/* innerHTML will be set by getState() */}</span>
                    </h4>
                </div>
                <button
                    className="buttonReal"
                    onClick={() => {
                        action();
                    }}
                >
                    Inspect selected slots
                </button>
            </div>
        </>
    );
}
