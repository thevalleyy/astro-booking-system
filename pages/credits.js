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
                    <u>Website</u>
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
                    . Dieses Projekt ist unter der{" "}
                    <a href="https://github.com/thevalleyy/astro-booking-system/blob/main/LICENSE" target="_blank">
                        GNU General Public License v3.0
                    </a>
                    {" "}lizenziert.
                </h3>
                <br></br>
                <h2>
                    <u>Font Awesome</u>
                </h2>
                <h3>
                    Icons von{" "}
                    <a href="https://fontawesome.com" target="_blank">
                        Font Awesome
                    </a>
                    .
                </h3>
                <br></br>
                <h2>
                    <u>Schriftart</u>
                </h2>
                <h3>
                    <p>&#34;Montserrat&#34; von Julieta Ulanovsky, verfügbar unter der SIL Open Font License 1.1: </p>
                    <a href="https://fonts.google.com/specimen/Montserrat" target="_blank">
                        https://fonts.google.com/specimen/Montserrat
                    </a>
                </h3>
                <br></br>
                <h2>
                    <u>Favicon</u>
                </h2>
                <h3>
                    <p>Dieses Favicon wurde unter Verwendung der folgenden Grafiken von Twitter Twemoji erstellt:</p>
                    <p>
                        Titel:{" "}
                        <a href="https://github.com/twitter/twemoji/blob/master/assets/svg/2728.svg" target="_blank">
                            2728.svg
                        </a>
                    </p>
                    <p>
                        Ersteller:{" "}
                        <a href="https://github.com/twitter/twemoji" target="_blank">
                            Copyright 2020 Twitter, Inc und andere Mitwirkende
                        </a>
                    </p>
                    <p>
                        Quelle:{" "}
                        <a href="https://github.com/twitter/twemoji/blob/master/assets/svg/2728.svg" target="_blank">
                            https://github.com/twitter/twemoji/blob/master/assets/svg/2728.svg
                        </a>
                    </p>
                    <p>
                        Lizenz:{" "}
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
                    <span className="btn-text">Zurück zur Startseite</span>
                </button>
            </div>
        </>
    );
}
