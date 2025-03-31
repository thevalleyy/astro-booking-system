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
                    a.download = "table" + new Date().toISOString().replace(/-|:/g, "_") + ".json";
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
            alertBox("Fehler beim Herunterladen von table.json. Mehr Details in der Konsole.", "error");
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

                setUpdated("Zuletzt aktualisiert: " + new Date(table.updated).toLocaleString());
            })
            .catch((error) => {
                console.log(error);
                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                return;
            });
    } catch (error) {
        console.error(error);
        alertBox("Fehler beim Markieren gebuchter Slots. Mehr Infos in der Konsole", "error");
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
        alertBox("Fehler beim Umschalten des Status. Mehr Infos in der Konsole", "error");
    }
}

async function getState() {
    try {
        await axios
            .get("/api/getState")
            .then((res) => {
                const state = res.data.enabled;
                if (state) {
                    document.getElementById("switchText").innerText = "Deaktivieren";
                    document.getElementById("switchColor").innerHTML = `<span style="color: green">Aktiviert</span>`;
                } else {
                    document.getElementById("switchText").innerText = "Aktivieren";
                    document.getElementById("switchColor").innerHTML = `<span style="color: red">Deaktiviert</span>`;
                }
            })
            .catch((error) => {
                console.log(error);
                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                return;
            });
    } catch (error) {
        console.error(error);
        alertBox("Fehler beim Anfragen des Status. Mehr Infos in der Konsole", "error");
    }
}

function bookAnimation(action = "start", btn = "save") {
    const dotsArray = [".", "..", "...", ".."];
    const button = document.getElementById(btn + "Button");
    const originalValue = button.innerText.replaceAll(".", "");

    if (action == "start") {
        let i = 0;
        button.disabled = true;

        window.buttonTextInterval = setInterval(() => {
            button.innerText = originalValue + dotsArray[i];
            i = (i + 1) % dotsArray.length;
        }, 500);
    } else {
        button.disabled = false;
        button.innerText = originalValue;
        clearInterval(window.buttonTextInterval);
    }
}

async function updateSlots() {
    const modal = document.getElementById("myModal");
    if (!modal.style.display || modal.style.display == "none") {
        alertBox("No opened modal", "info", 3000);
        return;
    }

    const modalContent = document.querySelector(".modal-content").children[1];
    const inputs = modalContent.getElementsByClassName("modalInput");
    const values = {};

    for (let input of inputs) {
        values[input.id] = input.value;
    }

    if (values["booking"] == "/") {
        // new booking
        const newTimeSlot = values["newTimeSlot"];
        const firstname = values["firstname"];
        const lastname = values["lastname"];
        const bookedSlots = values["bookedSlots"];
        const email = values["email"];

        if (!firstname || !lastname || !bookedSlots || !email || !newTimeSlot) {
            alertBox("Bitte alle Felder ausfüllen", "info", 3000);
            return;
        }

        if (bookedSlots < 1) {
            alertBox("Bitte mindestens einen Slot buchen", "info", 3000);
            return;
        }

        bookAnimation("start", "save");

        // create booking
        await axios
            .post("/api/editEntry", { new: true, newTimeSlot, firstname, lastname, bookedSlots, email })
            .then((res) => {
                bookAnimation("stop", "save");
                if (res.data.success) {
                    alertBox(res.data.message, "success", 10000);
                    modal.style.display = "none";
                } else {
                    alertBox(res.data.message, "error", 10000);
                }
            })
            .catch((error) => {
                console.log(error);
                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                bookAnimation("stop", "save");
                return;
            });

        return;
    }

    const timeSlot = values["booking"].split(".")[0];
    const id = values["booking"].split(".")[1];

    if (!values["firstname"] || !values["lastname"] || !values["bookedSlots"] || !values["email"] || !values["newTimeSlot"]) {
        alertBox("Bitte alle Felder ausfüllen", "info", 3000);
        return;
    }

    if (values["bookedSlots"] < 1) {
        deleteBooking();
        return;
    }

    bookAnimation("start", "save");

    // update booking
    await axios
        .post("/api/editEntry", { new: false, timeSlot, id, ...values })
        .then((res) => {
            bookAnimation("stop", "save");
            if (res.data.success) {
                alertBox(res.data.message, "success", 10000);
                modal.style.display = "none";
            } else {
                alertBox(res.data.message, "error", 10000);
            }
        })
        .catch((error) => {
            console.log(error);
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
            bookAnimation("stop", "save");
            return;
        });
}

async function deleteBooking() {
    bookAnimation("start", "delete");

    const modal = document.getElementById("myModal");
    const timeSlot = document.getElementById("booking").value.split(".")[0];
    const id = document.getElementById("booking").value.split(".")[1];
    
    // delete booking
    await axios
        .post("/api/deleteEntry", { timeSlot, id })
        .then((res) => {
            bookAnimation("stop", "delete");
            if (res.data.success) {
                alertBox(res.data.message, "success", 10000);
                modal.style.display = "none";
            } else {
                alertBox(res.data.message, "error", 10000);
            }
        }).catch((error) => {
            console.log(error);
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
            bookAnimation("stop", "delete");
            return;
        })
}

function action() {
    const slot = document.getElementsByClassName("selected")[0];

    if (!slot) {
        alertBox("Keine Slots ausgewählt", "info", 3000);
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
        // create the modal content
        const modalContent = document.querySelector(".modal-content").children[1];
        const inputs = modalContent.getElementsByClassName("modalInput");
        inputs[0].value = `/`;
        inputs[1].value = headers[timeslot];
        inputs[2].value = "";
        inputs[2].placeholder = "Max"
        inputs[3].value = "";
        inputs[3].placeholder = "Mustermann"
        inputs[4].value = "";
        inputs[4].placeholder = "2"
        inputs[5].value = "";
        inputs[5].placeholder = "email@example.com"
        inputs[6].value = "/"
        document.getElementById("updatedAt").style.display = "none";
        document.getElementById("deleteButton").style.display = "none";
        document.getElementById("saveButton").innerText = "Buchen";

        // display the modal
        modal.style.display = "block";
        return;
    }

    // open booking info modal
    axios
        .get("/api/getAdminData")
        .then((res) => {
            const table = res.data.message.table;
            const booking = table.data[timeslot][id];

            if (!booking) {
                alertBox("Keine Buchung gefunden", "error", 3000);
                return;
            }

            // create the modal content
            const modalContent = document.querySelector(".modal-content").children[1];
            const inputs = modalContent.getElementsByClassName("modalInput");
            inputs[0].value = `${timeslot}.${id}`;
            inputs[1].value = timeslot;
            inputs[2].value = booking.firstname;
            inputs[3].value = booking.lastname;
            inputs[4].value = booking.bookedSlots;
            inputs[5].value = booking.email;
            inputs[6].value = new Date(booking.time).toLocaleString();
            if (booking.updatedAt) {
                document.getElementById("updatedAt").style.display = "contents";
                inputs[7].value = new Date(booking.updatedAt).toLocaleString();
            } else {
                document.getElementById("updatedAt").style.display = "none";
            }

            document.getElementById("deleteButton").style.display = "block";
            document.getElementById("saveButton").innerText = "Speichern";

            // display the modal
            modal.style.display = "block";
        })
        .catch((error) => {
            console.log(error);
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
            return;
        });
}

async function deleteEverything() {
    if (!confirm("Alle Buchungen löschen?")) return;
    if (!confirm("Ganz sicher??")) return;

    bookAnimation("start", "deleteAll");

    
    await axios
        .post("/api/deleteAll")
        .then((res) => {
            bookAnimation("stop", "deleteAll");
            if (res.data.success) {
                alertBox(res.data.message, "success");
                document.getElementById("refreshButton").click();
            } else {
                alertBox(res.data.message, "error");
            }
        })
        .catch((error) => {
            console.log(error);
            alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
            bookAnimation("stop", "deleteAll");
            return;
        });
}

export default function Home() {
    const [updated, setUpdated] = useState("Daten abrufen...");
    const times = headers;
    let clickedAgain = false;

    useEffect(() => {
        // event listeners
        document.getElementById("cbmode").addEventListener("click", function () {
            cbmode();
        });

        // close modal on escape
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                document.getElementById("myModal").style.display = "none";
            }
            
            if (event.key === "Enter" && document.getElementById("myModal").style.display == "block") {
                document.getElementById("saveButton").click();
            }

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
                    alertBox("Eingeloggt", "success", 2000);
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
            <div id="myModal" className="modal">
                <div className="modal-content">
                    <span
                        className="close no-select"
                        onClick={() => {
                            document.getElementById("myModal").style.display = "none";
                        }}
                    >
                        &times;
                    </span>
                    <div>
                        <h2>Infos zur Buchung</h2>
                        <br></br>
                        <div className="table">
                            <div className="row">
                                <div className="cell header">Feld</div>
                                <div className="cell header">Wert</div>
                            </div>
                            <div className="row">
                                <div className="cell">Timeslot.ID</div>
                                <div className="cell">
                                    <input className="modalInput disabled" id="booking" type="text" defaultChecked="..." disabled readOnly />
                                </div>
                            </div>
                            <div className="row">
                                <div className="cell">Zeitslot</div>
                                <div className="cell">
                                    <select className="modalInput" id="newTimeSlot">
                                        {times.map((time) => (
                                            <option key={`${time}`} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="cell">Vorname</div>
                                <div className="cell">
                                    <input className="modalInput" id="firstname" type="text"  />
                                </div>
                            </div>
                            <div className="row">
                                <div className="cell">Nachname</div>
                                <div className="cell">
                                    <input className="modalInput" id="lastname" type="text"  />
                                </div>
                            </div>
                            <div className="row">
                                <div className="cell">Slots gebucht</div>
                                <div className="cell">
                                    <input className="modalInput" id="bookedSlots" type="text"  />
                                </div>
                            </div>
                            <div className="row">
                                <div className="cell">Email</div>
                                <div className="cell">
                                    <input className="modalInput" id="email" type="text"  />
                                </div>
                            </div>
                            <div className="row">
                                <div className="cell">Gebucht am</div>
                                <div className="cell">
                                    <input
                                        id="bookedAt"
                                        className="modalInput disabled"
                                        type="text"
                                        defaultValue="..."
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="row" id="updatedAt">
                                <div className="cell">Aktualisiert am</div>
                                <div className="cell">
                                    <input
                                        id="updatedAt"
                                        className="modalInput disabled"
                                        type="text"
                                        defaultValue="..."
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <button
                            className="buttonReal"
                            style={{ marginRight: "1vw" }}
                            onClick={() => {
                                document.getElementById("myModal").style.display = "none";
                            }}
                        >
                            Abbrechen
                        </button>
                        <button
                            className="buttonReal"
                            style={{ marginRight: "1vw" }}
                            id="deleteButton"
                            onClick={() => {
                                deleteBooking();
                            }}
                        >
                            Löschen
                        </button>
                        <button
                            className="buttonReal"
                            id="saveButton"
                            onClick={() => {
                                updateSlots();
                            }}
                        >
                            Speichern
                        </button>
                    </div>
                </div>
            </div>
            <div className="alert">
                <span
                    className="closebtn no-select"
                    id ="closebtn"
                >
                    &times;
                </span>
                <span>Das ist eine Benachrichtigung.</span>
            </div>

            <p style={{ display: "none" }} id="var"></p>
            <p style={{ display: "none" }} id="firstLoad">
                true
            </p>
            <div className="center-H">
                <h1>Zeitplan</h1>
                <h2>{updated}</h2>
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
                        document.location.href = "./countdown";
                    }}
                >
                    Countdown
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
                                    alertBox("Fehler beim Ausloggen", "error");
                                }
                            })
                            .catch((error) => {
                                alertBox(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`, "error");
                            });
                    }}
                >
                    Ausloggen
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
                    alertBox("Fehler bei der WebSocket-Verbindung. Live-Aktualisierungen sind deaktiviert.", "error");
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
                                    key={`${rowIndex}_${colIndex}`}
                                    id={`${colIndex}_${rowIndex}`}
                                    title="Anklicken um zu verwalten"
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
                <button
                    className="buttonReal"
                    onClick={() => {
                        action();
                    }}
                >
                    Ausgewählte Slots verwalten
                </button>
                <div style={{ marginRight: "2vw", marginLeft: "2vw" }}>
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
                                    alertBox("Sicher, dass der Modus gewechselt werden soll? Wenn ja, innerhalb von 5 Sekunden erneut klicken.", "info", 5000);
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
                        Aktuell: <span id="switchColor">{/* innerHTML will be set by getState() */}</span>
                    </h4>
                </div>
                <div className="nextToEachOther">
                    <input type="checkbox" id="cbmode"></input>
                    <h4
                        className="no-select"
                        onClick={() => {
                            document.getElementById("cbmode").click();
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        Farbblind-Modus
                    </h4>
                </div>
                <button
                    style={{ marginRight: "2vw" }}
                    className="buttonReal"
                    onClick={() => {
                        markBookedSlots(setUpdated, "dl");
                    }}
                >
                    table.json herunterladen
                </button>
                <button
                    style={{ backgroundColor: "#ff3f3f" }}
                    className="buttonReal"
                    id = "deleteAllButton"
                    onClick={() => {
                        deleteEverything();
                    }}
                >
                    ALLE Buchungen löschen
                </button>
            </div>
        </>
    );
}
