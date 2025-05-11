function hideEscPopup(area, container, callback) {
    area.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            callback(container);
        }
    });
}

function removeEscPopupListener(area, container, callback) {
    const popup = container.innerHTML;
    if (!popup) {
        area.removeEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                callback(container);
            }
        });
    }
}

export {
    hideEscPopup,
    removeEscPopupListener,
}