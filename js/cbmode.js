export default function cbmode() {
    const slots = document.getElementsByClassName("slot");
    if (document.getElementById("cbmode").checked) {
        for (let i = 0; i < slots.length; i++) {
            // Enable colorblind mode
            let emoji = "";
            if (slots[i].classList.contains("booked")) {
                emoji = "⚠️";
            } else if (slots[i].classList.contains("clicked")) {
                emoji = "🎯";
            } else if (slots[i].classList.contains("bookedByClient")) {
                emoji = "✨";
            }
            slots[i].innerHTML = slots[i].textContent.replace(/⚠️|🎯|✨/g, "").trim() + emoji;
        }

        const legend = document.getElementsByClassName("legend")[0].children[0].children[0]; // table
        if (legend) {
            // cycle through all its children and add the emoji
            for (let j = 0; j < legend.children.length; j++) {
                legend.children[j].children[0].style.opacity = 1;
            }
        }
    } else {
        for (let i = 0; i < slots.length; i++) {
            // Disable colorblind mode
            slots[i].innerHTML = slots[i].textContent.replace(/⚠️|🎯|✨/g, "").trim();
        }

        const legend = document.getElementsByClassName("legend")[0].children[0].children[0]; // table
        if (legend) {
            // cycle through all its children and add the emoji
            for (let j = 0; j < legend.children.length; j++) {
                legend.children[j].children[0].style.opacity = 0;
            }
        }
    }
}
