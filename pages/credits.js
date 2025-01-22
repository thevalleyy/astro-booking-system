// packages
import React, { useEffect, useState } from "react";
import Head from "next/head";

// files
import config from "../config.json" with { type: "json" };

// variables
const metaData = config["html-meta-data"];
const title = config.settings.title;

export default function Home() {
    useEffect(() => {}, []);

    return (
        <>
            <Head>
                <title>{`${title} – Credits`}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>

            <div className="center-H">
                <br></br>
                <h1>
                    <span className="highlighted">Credits</span>
                </h1>
                <br></br>
                <h2>
                    <u>Wepbage</u>
                </h2>
                <h3>
                    © 2025{" "}
                    <a href="https://github.com/Dodorex-code" target="_blank">
                        Dodorex
                    </a>
                    ,{" "}
                    <a href="https://github.com/thevalleyy" target="_blank">
                        thevalleyy
                    </a>
                    ,{" "}
                    <a href="https://github.com/Xanover" target="_blank">
                        Xanover
                    </a>
                    . This project is licensed unter the{" "}
                    <a href="https://github.com/thevalleyy/astro-booking-system/blob/main/LICENSE" target="_blank">
                        GNU General Public License v3.0
                    </a>
                    .
                </h3>
                <br></br>
                <h2>
                    <u>Font Awesome</u>
                </h2>
                <h3>
                    Icons by{" "}
                    <a href="https://fontawesome.com" target="_blank">
                        Font Awesome
                    </a>
                    .
                </h3>
                <br></br>
                <h2>
                    <u>Font</u>
                </h2>
                <h3>
                    <p>Font &#34;Montserrat&#34; by Julieta Ulanovsky, available under the SIL Open Font License 1.1: </p>
                    <a href="https://fonts.google.com/specimen/Montserrat" target="_blank">
                        https://fonts.google.com/specimen/Montserrat
                    </a>
                </h3>
                <br></br>
                <h2>
                    <u>Favicon</u>
                </h2>
                <h3>
                    <p>This favicon was generated using the following graphics from Twitter Twemoji:</p>
                    <p>
                        Graphics Title:{" "}
                        <a href="https://github.com/twitter/twemoji/blob/master/assets/svg/2728.svg" target="_blank">
                            2728.svg
                        </a>
                    </p>
                    <p>
                        Graphics Author:{" "}
                        <a href="https://github.com/twitter/twemoji" target="_blank">
                            Copyright 2020 Twitter, Inc and other contributors
                        </a>
                    </p>
                    <p>
                        Graphics Source:{" "}
                        <a href="https://github.com/twitter/twemoji/blob/master/assets/svg/2728.svg" target="_blank">
                            https://github.com/twitter/twemoji/blob/master/assets/svg/2728.svg
                        </a>
                    </p>
                    <p>
                        Graphics License:{" "}
                        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">
                            CC-BY 4.0
                        </a>
                    </p>
                </h3>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <div className="center-H">
                <button
                    className="buttonReal"
                    id="backbutton"
                    type="submit"
                    onClick={() => {
                        window.location.href = "/";
                    }}
                >
                    <span className="btn-text">Back to homepage</span>
                </button>
            </div>
        </>
    );
}
