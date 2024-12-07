import React, { useEffect, useState } from "react";
import Head from "next/head";
const metaData = require("../config.json")["html-meta-data"];
const maxSlots = require("../config.json")["settings"]["slotsPerColumn"];

import axios from "axios";

const requestData = () => {
    const password = document.getElementById("password").value;
    axios
        .post("/api/getAdminData", { password: password })
        .then((res) => {
            buildTable(res.data.message);
        })
        .catch((error) => {
            alert(`Error ${error?.response?.data.code || error} ${error?.response?.data.message || ""}`);
        });
};

// TODO: Admin panel websocket refresh
// TODO: repace alert() by custom modal

const buildTable = (data) => {
    // delete the whole document
    const existingTable = document.querySelectorAll(".fullscreen");
    if (existingTable.length > 0) {
        existingTable.forEach((table) => {
            table.remove();
        });
    }

    // create new fullscreen
    const fullscreen = document.createElement("div");
    fullscreen.className = "fullscreen";

    fullscreen.innerHTML = `
    <h1>
    Admin Table - Last update: ${new Date(data["data"]["updated"]).toLocaleString()}
    <h1 class="backToHome">
    <a href="./table"> Booking panel</a> <a href="."> Home</a>
    </h1>`;

    // create table
    const table = document.createElement("table");
    table.className = "schedule";

    // inizialize thead and tbody
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers = Object.keys(data["data"]["data"]); // fucking genius

    // create the headers
    const headerRow = document.createElement("tr");
    headers.forEach((header, index) => {
        const th = document.createElement("th");
        th.className = "header";
        th.id = index;
        th.appendChild(document.createTextNode(header));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // create empty cells
    for (let i = 0; i < maxSlots; i++) {
        const tr = document.createElement("tr");
        Array.from(table.querySelectorAll(".header")).forEach((header, index) => {
            const td = document.createElement("td");
            td.className = "slot";
            td.id = `${index}_${i}`;
            td.textContent = `${index} ${i}`;
            td.onclick = () => {
                alert("Empty slot");
            };
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    fullscreen.appendChild(table);
    document.body.appendChild(fullscreen);

    // color cells
    Object.keys(data["data"]["data"]).forEach((timeslot) => {
        Object.keys(data["data"]["data"][timeslot]).forEach((booking) => {
            const slot = data["data"]["data"][timeslot][booking]; // sometimes I hate myself

            // find header
            const headers = table.querySelectorAll(".header");
            const header = Array.from(headers).find((header) => header.textContent === timeslot);

            // color the slots
            for (let i = 0; i < slot.bookedSlots; i++) {
                const slotElement = document.getElementById(`${header.id}_${i}`);
                slotElement.classList.add("bookedByClient");
                slotElement.onclick = () => {
                    alert(`Client: ${slot.firstname} ${slot.lastname}\nEmail: ${slot.email} \nBooked at ${new Date(slot.time).toLocaleString()}`);
                };
            }
        });
    });
};

export default function Home() {
    useEffect(() => {}, []);
    return (
        <>
            <Head>
                <title>astro-booking-system - admin</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>

            <div className="fullscreen">
                <h1 className="backToHome">
                    <a href="./table"> Booking panel</a> <a href="."> Home</a>
                </h1>
                <br></br>
                <h1 className="center-H">Identify yourself</h1>
                <br></br>
                <div className="nextToEachOther">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            requestData();
                        }}
                    >
                        <label htmlFor="name">Password:</label>
                        <input type="text" id="password" name="paddword" required size="10" />

                        <input type="submit" value="Authenticate" style={{ fontSize: "2em", marginTop: "10px" }}></input>
                    </form>
                </div>
            </div>
        </>
    );
}
