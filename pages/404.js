import Head from "next/head";
const config = require("../config.json");
const metaData = config["html-meta-data"];

export default function FourOhFour() {
    return (
        <>
            <Head>
                <title>404 - Not Found</title>
                <link rel="icon" href="/favicon.ico" />
                <meta content={metaData.title} property="og:title" />
                <meta content="website" property="og:type" />
                <meta content={metaData.description} property="og:description" />
                <meta content={metaData.url} property="og:url" />
                <meta content={metaData.image} property="og:image" />
                <meta content={metaData.color} name="theme-color" />
                {metaData.large_image ? <meta content="summary_large_image" name="twitter:card" /> : ""}
            </Head>
            <div className="center fullscreen">
                <p className="no-select">How did you manage to do that? :)</p>
                <br></br>
                <p className="no-select">This page does not exist</p>
                <p className="no-select"></p>
                <div className="no-select btns">
                    <button
                        className="btn"
                        id="backbutton"
                        style={{ marginRight: "2px", marginLeft: "auto" }}
                        type="submit"
                        onClick={() => {
                            history.go(-1);
                        }}
                    >
                        <span className="btn-text">Back</span>
                    </button>
                    <button
                        className="btn"
                        id="homebutton"
                        style={{ marginRight: "2px" }}
                        type="submit"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        <span className="btn-text">Home</span>
                    </button>
                </div>
            </div>
        </>
    );
}
