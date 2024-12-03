import React, { useEffect, useState } from "react";
import Head from "next/head";

const metaData = require("../config.json")["html-meta-data"];
const { imprintURL } = require("../config.json").settings;

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

            <div className="fullscreen">
                <br></br>
                <h1 className="center-H">Welcome to the Astro Booking System</h1>
                <br></br>
                <h2 className="center-H">Here's how it works ... </h2>
                <br></br>
                <div className="nextToEachOther">
                    <button
                        type="button"
                        style={{ fontSize: 30, margin: "10px" }}
                        onClick={() => {
                            window.location.href = "./table";
                        }}
                    >
                        Time schedule & booking
                    </button>
                    <button
                        type="button"
                        style={{ fontSize: 30, margin: "10px" }}
                        onClick={() => {
                            window.open(imprintURL, "_blank");
                        }}
                    >
                        Imprint
                    </button>
                    <button
                        type="button"
                        style={{ fontSize: 30, margin: "10px" }}
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
