import React, { useEffect, useState } from "react";
import Head from "next/head";

import config from "../config.json" with { type: "json" };
const metaData = config["html-meta-data"];
const { imprintURL } = config.settings;

export default function Home() {
    useEffect(() => {}, []);
    return (
        <>
            <Head>
                <title>astro-booking-system - home</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>

            <div className="fullscreen no-select">
                <div className="center-H">
                    <br></br>
                    <h1>Welcome to the Astro Booking System</h1>
                    <h2>Here&#39;s how it works ... </h2>
                    <br></br>
                    <h3 style={{ maxWidth: "80%" }}>
                        On the <a href="./table">time schedule</a> page you can see the available time slots. You can book a time slot by clicking on
                        it and filling out the form. You will receive a confirmation email after booking.
                    </h3>
                    <br></br>
                    <br></br>
                    <h2>Table explanation</h2>
                    <br></br>
                    <div className="nextToEachOther">
                        <div className="center-H">
                            <h3>Top row: Timeslots</h3>
                            <h3>Other rows: Slots to book</h3>
                        </div>

                        <table>
                            <thead>
                                <tr>
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
                                    <td className="slot booked"></td>
                                    <td className="slot clicked"></td>
                                    <td className="slot bookedByClient"></td>
                                </tr>
                            </tbody>
                        </table>
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
                    <h3>That&#39;s it! Happy booking</h3>
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
                        Time schedule & booking
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
                        Free and open source on GitHub
                    </button>
                </div>
            </div>
        </>
    );
}
