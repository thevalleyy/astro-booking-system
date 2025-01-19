import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import cookie from "cookie";

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
        res.setHeader("Set-Cookie", cookie.serialize("password", "", {
            path: "/",
            expires: new Date(0), 
            httpOnly: true, 
            secure: true, 
            sameSite: "strict",
        }));

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

export default function Home() {
    useEffect(() => {
        // trigger only if the page is loaded, not on every reload
        const navigationEntries = performance.getEntriesByType("navigation");

        if (navigationEntries.length > 0) {
            const navigationEntry = navigationEntries[0];
            if (navigationEntry.type != "reload") alertBox("Logged in", "success", 2000);
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
            <div style={{ display: "none" }}>
                <button
                    onClick={() => {
                        requestData();
                    }}
                    id="refreshButton"
                ></button>
                <button
                    onClick={() => {
                        alertBox("The websocket connection failed. Live updates are disabled.", "error", 5000);
                    }}
                    id="wsError"
                ></button>
            </div>
            <div className="fullscreen">
                <h1 className="backToHome">
                    <button
                        className="buttonList"
                        onClick={() => {
                            document.location.href = "./table";
                        }}
                    >
                        Booking panel
                    </button>
                    <button
                        className="buttonList"
                        onClick={() => {
                            document.location.href = "./";
                        }}
                    >
                        Home
                    </button>
                </h1>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
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
                                <br></br>
                                <div className="center-H nextToEachOther">
                                    <input type="checkbox" id="cbmode"></input>
                                    <h4 className="no-select" onClick={() => {document.getElementById("cbmode").click()}} style={{cursor:"pointer"}}>I&#39;m colorblind</h4>
                                </div>
            </div>
        </>
    );
}
