import React, { useEffect, useState } from "react";
import axios from "axios";

import tableHeaders from "../../js/tableHeaders.js";
const config = require("../../config.json");
const { slotsPerColumn } = config.settings;
const { checks } = config.settings;

const bookSlots = (setUpdated) => {
    // send the data to the server and handle the response
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;

    // // transform the slots into an array of strings of their id
    const slotsArr = Array.from(document.getElementsByClassName("clicked")).map((slot) => slot.id);

    if (slotsArr.length === 0) {
        alert("Please select at least one slot");
        return;
    }

    // // slots can only be booked in one column
    const firstColumn = slotsArr[0]?.split("_")[0] || "0";
    for (let i = 1; i < slotsArr.length; i++) {
        if (slotsArr[i].split("_")[0] !== firstColumn) {
            alert("You can only book slots in one column");
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
            setUpdated("Last update: " + new Date(response.data.message.updated).toLocaleString());
            markBookedSlots(setUpdated);

            // remove the content of the input fields
            document.getElementById("firstname").value = "";
            document.getElementById("lastname").value = "";
            document.getElementById("email").value = "";

            alert("Booking successful");
        })
        .catch((error) => {
            alert(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`);
        });
};

const markBookedSlots = (setUpdated) => {
    // get number of booked slots for each time slot
    axios
        .get("/api/getBookings")
        .then((response) => {
            // remove all clicked or booke slots
            const clickedSlots = document.getElementsByClassName("clicked");
            while (clickedSlots.length > 0) {
                clickedSlots[0].classList.remove("clicked");
            }

            const bookedSlots = document.getElementsByClassName("booked");
            while (bookedSlots.length > 0) {
                bookedSlots[0].classList.remove("booked");
            }

            // color the booked slots
            const slots = response.data.message.data;
            Object.keys(slots).forEach((key) => {
                for (let i = 0; i < slots[key]; i++) {
                    const index = Object.keys(slots).indexOf(key);
                    document.getElementById(`${index}_${i}`).classList.add("booked");
                    document.getElementById(`${index}_${i}`).style.cursor = "not-allowed";
                    document.getElementById(`${index}_${i}`).title = "Already booked";
                }
            });

            setUpdated("Last update: " + new Date(response.data.message.updated).toLocaleString());
        })
        .catch((error) => {
            alert(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`);
        });
};

const TimeTable = () => {
    const [updated, setUpdated] = useState("Fetching data...");

    // Generate the times for the table headers
    const times = tableHeaders();

    useEffect(() => {
        markBookedSlots(setUpdated);
    }, []);

    return (
        <div>
            <h1>Time Table - {updated}</h1>
            <button
                style={{ display: "none" }}
                onClick={() => {
                    markBookedSlots(setUpdated);
                }}
                id="refreshButton"
            ></button>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        {times.map((time, index) => (
                            <th
                                className="header"
                                key={`${time}`} // Added a unique key
                                id={index}
                                style={{
                                    border: "1px solid #000",
                                    padding: "8px",
                                    textAlign: "center",
                                    backgroundColor: "#f2f2f2",
                                }}
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
                                    onClick={() => {
                                        if (document.getElementById(`${colIndex}_${rowIndex}`).classList.contains("booked")) return;
                                        document.getElementById(`${colIndex}_${rowIndex}`).classList.toggle("clicked");
                                    }}
                                    key={`${rowIndex}_${colIndex}`}
                                    id={`${colIndex}_${rowIndex}`}
                                    style={{
                                        border: "1px solid #000",
                                        padding: "8px",
                                        textAlign: "center",
                                    }}
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
                    bookSlots(setUpdated);
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

                <input type="submit" value="Book" style={{ fontSize: "2em", marginTop: "10px" }}></input>
            </form>
        </div>
    );
};

export default TimeTable;
