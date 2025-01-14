// packages
import React, { useEffect } from "react";
import Head from "next/head";

// files
import config from "../config.json" with { type: "json" };

// variables
const metaData = config["html-meta-data"];
const { imprintURL } = config.settings;
const maxSlots = config.settings.checks.maxBookedSlots;
const mail = config.settings.adminMail;

// functions
import cbmode from "@/js/cbmode";


export default function Home() {
    useEffect(() => {
                document.getElementById("cbmode").addEventListener("click", function () {
                    cbmode();
                });
    }, []);

    return (
        <>
            <Head>
                <title>Astro Booking System - Home</title>
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
                <div className="center-H">
                    <br></br>
                    <h1>Welcome to the Astro Booking System</h1>
                    <h2>How it works:</h2>
                    <br></br>
                    <h3>
                        On the time schedule page, you can view all slots. You can book a free one by clicking on it and filling out the form. A confirmation email will be sent to you after booking.
                    </h3>
                    <br></br>
                    <h3>
                        Note: You can book a maximum of <span className="highlighted">{maxSlots} slots</span>.
                    </h3>
                    <h3>
                        Once you choose a time slot, you can only book slots within that time frame.
                    </h3>
                    <h3>
                        If there are any issues, please contact the admin at <a href={mail}> {mail}</a>.
                    </h3>
                    <br></br>
                    <h2>Table Explanation:</h2>
                    <br></br>
                    <div className="nextToEachOther">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <h3 style={{ paddingRight: "1em", float: "right" }}>Time slots</h3>
                                    </th>
                                    <th className="header" id="0">
                                        18:00
                                    </th>
                                    <th className="header" id="1">
                                        19:00
                                    </th>
                                    <th className="header" id="2">
                                        20:00
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><h3 style={{ paddingRight: "1em", float: "right" }}>Slots to book</h3></td>
                                    <td className="slot booked"></td>
                                    <td className="slot clicked"></td>
                                    <td className="slot bookedByClient"></td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <input type="checkbox" id="cbmode"></input>
                            <h4 className="no-select" onClick={() => {document.getElementById("cbmode").click()}} style={{cursor:"pointer"}}>I&#39;m colorblind</h4>
                        </div>
                    </div>
                    <br></br>
                    <table>
                        <tbody>
                            <tr>
                                <td className="slot"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Free slot</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="slot clicked"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Selected by you</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="slot bookedByClient"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Booked by you</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="slot booked"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Booked by another user</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br></br>
                    <h3>That&#39;s it! Happy booking!</h3>
                    <br></br>
                </div>

                <div className="nextToEachOther">
                    <button
                        type="button"
                        className="buttonReal"
                        onClick={() => {
                            window.location.href = "./table";
                        }}
                    >
                        Time Schedule & Booking
                    </button>
                    <button
                        type="button"
                        className="buttonReal"
                        onClick={() => {
                            window.open(imprintURL, "_blank");
                        }}
                    >
                        Imprint
                    </button>
                    <button
                        type="button"
                        className="buttonReal"
                        onClick={() => {
                            window.open("https://github.com/thevalleyy/astro-booking-system", "_blank");
                        }}
                    >
                        Free and Open Source on GitHub
                    </button>
                </div>
            </div>
        </>
    );
}
