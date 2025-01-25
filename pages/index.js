// packages
import React, { useEffect, useState } from "react";
import Head from "next/head";

// files
import config from "../config.json" with { type: "json" };

// variables
const metaData = config["html-meta-data"];
const { imprintURL } = config.settings;
const maxSlots = config.settings.checks.maxBookedSlots;
const mail = config.settings.adminMail;
const title = config.settings.title;

// functions
import cbmode from "../js/cbmode";


export default function Home() {
    const [showUI, setShowUI] = useState(null);

    useEffect(() => {
                document.getElementById("cbmode").addEventListener("click", function () {
                    cbmode();
                });

                setShowUI(
                    <div>
                        <link
                            rel="stylesheet"
                            href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
                            integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/"
                            crossOrigin="anonymous"
                        ></link>
        
                        <ul>
                            <li>
                                <a href="https://github.com/thevalleyy/astro-booking-system" draggable="false" target="_blank">
                                    <i class="fab fa-github"></i>
                                </a>
                                <a href="./credits" draggable="false" target="_self">
                                    <i class="far fa-copyright"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                );
    }, []);

    return (
        <>
            <Head>
                <title>{`${title} – Home`}</title>
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
                    <h1>Willkommen beim <span className="highlighted">Astro Booking System</span></h1>
                    <br></br>
                    <h2>So funktionierts:</h2>
                    <h3>
                        Auf der Zeitplan-Seite kannst du alle Termine einsehen. Du kannst einen freien Slot buchen, indem du ihn anklickst und das Formular ausfüllst. Nach der Buchung wird dir eine Bestätigungs-E-Mail zugesandt.
                    </h3>
                    <br></br>
                    <h3>
                        Du kannst maximal <span className="highlighted">{maxSlots} Slots buchen</span>.
                    </h3>
                    <h3>
                        Sobald du dich für ein Zeitfenster entschieden hast, kannst du <i>nurnoch innerhalb dieses Zeitfensters</i> buchen.
                    </h3>
                    <h3>
                        Sobal du einen Slot gebucht hast, kannst du ihn <span className="highlighted">nicht mehr entbuchen</span>.
                    </h3>
                    <h3>
                        Falls es jegliche Probleme gibt, wende dich bitte an den Admin via <a href={`mailto:${mail}`}> {mail}</a>.
                    </h3>
                    <br></br>
                    <h2>Erläuterung der Tabelle:</h2>
                    <div className="nextToEachOther">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <h3 style={{ paddingRight: "1em", float: "right" }}>Zeitfenster</h3>
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
                                    <td><h3 style={{ paddingRight: "1em", float: "right" }}>Slots zum Buchen</h3></td>
                                    <td className="slot booked"></td>
                                    <td className="slot clicked"></td>
                                    <td className="slot bookedByClient"></td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <input type="checkbox" id="cbmode"></input>
                            <h4 className="no-select" onClick={() => {document.getElementById("cbmode").click()}} style={{cursor:"pointer"}}>Farbblind-Modus</h4>
                        </div>
                    </div>
                    <br></br>
                    <table>
                        <tbody>
                            <tr>
                                <td className="slot"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Freier Slot</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="slot clicked"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Von dir ausgewählt</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="slot bookedByClient"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Von dir gebucht</h3>
                                </td>
                            </tr>
                            <tr>
                                <td className="slot booked"></td>
                                <td>
                                    <h3 style={{ paddingLeft: "1em" }}>Von jemand anderem gebucht</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br></br>
                    <h3>Das wars schon. Viel Spaß!</h3>
                    <br></br>
                </div>

                <div className="nextToEachOther">
                    <button
                        type="button"
                        className="buttonReal"
                        href="./table"
                        onClick={() => {
                            window.location.href = "./table";
                        }}
                    >
                        Zeitplan & Buchen
                    </button>
                    <button
                        type="button"
                        className="buttonReal"
                        onClick={() => {
                            window.open(imprintURL, "_blank");
                        }}
                    >
                        Impressum
                    </button>
                </div>
                {showUI}
                <div className="credits no-select">
                    © 2025 <a href="https://github.com/Dodorex-code" target="_blank">Dodorex</a>, <a href="https://github.com/thevalleyy" target="_blank">thevalleyy</a>, <a href="https://github.com/Xanover" target="_blank">Xanover</a>. Dieses Projekt ist unter der <a href="https://github.com/thevalleyy/astro-booking-system/blob/main/LICENSE" target="_blank">GNU General Public License v3.0</a> lizenziert.
                </div>
        </>
    );
}
