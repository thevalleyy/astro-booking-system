export default function cbmode() {
    document.getElementById("cbmode").addEventListener("click", function () {
        const slots = document.getElementsByClassName("slot");
        for (let i = 0; i < slots.length; i++) {
            if (document.getElementById("cbmode").checked) {
                // Enable colorblind mode
                let emoji = "";
                if (slots[i].classList.contains("booked")) {
                    emoji = "⚠️";
                } else if (slots[i].classList.contains("clicked")) {
                    emoji = "🎯";
                } else if (slots[i].classList.contains("bookedByClient")) {
                    emoji = "✨";
                }
                slots[i].innerHTML = slots[i].textContent.trim() + `<span class="emoji">${emoji}</span>`;
            } else {
                // Disable colorblind mode
                slots[i].innerHTML = slots[i].textContent.replace(/⚠️|🎯|✨/g, "").trim();
            }
        }
    });
}
