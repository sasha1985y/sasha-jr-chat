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

/**
    @example function showElement(template, container) {

                if (currentElement) {
                    currentElement.remove();
                }

                currentElement = template.content.cloneNode(true).firstElementChild;
                container.innerHTML = "";
                container.appendChild(currentElement);
    }
*/

function showElement(template, container) {

    if (currentElement) {
        currentElement.remove();
    }

    currentElement = template.content.cloneNode(true).firstElementChild;
    container.innerHTML = "";
    container.appendChild(currentElement);
}

export {
    hideEscPopup,
    removeEscPopupListener,
    showElement,
}