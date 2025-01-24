/**
 * Display an alert box
 * @param {String} message The message to display
 * @param {String} type The type of the message
 * @param {Number} time The time in ms to display the message
 */
export default function alertBox(message, type, time) {
    const notification = document.getElementsByClassName("alert")[0];

    // random id for ambigous id
    const random = Math.random().toString(36).substring(2, 10);
    notification.id = random;

    notification.childNodes[1].innerText = message;
    notification.classList = `alert ${type} visible`;

    document.getElementById("closebtn").onclick = close;

    if (time) {
        setTimeout(() => {
            close();
        }, time);
    }

    function close() {
        const notification = document.getElementById(random);
        if (notification) {
            notification.classList.add("closing");

            notification.addEventListener(
                "transitionend",
                () => {
                    if (notification.classList.contains("closing")) notification.classList.remove("visible", "closing");
                },
                { once: true }
            );
        }
    }
}
