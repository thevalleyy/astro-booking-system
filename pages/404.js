import Head from "next/head";
import config from "../config.json" with { type: "json" };
const metaData = config["html-meta-data"];
const title = config.settings.title;

export default function FourOhFour() {
    return (
        <>
            <Head>
                <title>{`${title} – Not Found`}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>
            <div className="fullscreen no-select center-H">
                <h1 style={{ fontSize: "5em" }}>404</h1>
                <h1>How did you manage to do that?</h1>
                <h2>This page does not exist :(</h2>
                <div className="nextToEachOther">
                    <button
                        className="buttonReal"
                        id="backbutton"
                        type="submit"
                        onClick={() => {
                            history.go(-1);
                        }}
                    >
                        Back
                    </button>
                    <button
                        className="buttonReal"
                        id="homebutton"
                        type="submit"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        Home
                    </button>
                </div>
            </div>
        </>
    );
}
