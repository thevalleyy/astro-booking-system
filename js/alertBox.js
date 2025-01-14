/**
 * Display an alert box
 * @param {String} message The message to display
 * @param {String} type The type of the message
 * @param {Number} time The time in ms to display the message
 */
export default function alertBox(message, type, time) {
    const notification = document.getElementsByClassName("alert")[0];
    notification.childNodes[1].innerText = message;
    notification.classList = `alert ${type} visible`;

    if (time) {
        setTimeout(() => {
            notification.classList = "alert";
        }, time);
    }
}
