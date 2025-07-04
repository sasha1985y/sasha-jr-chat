/**
    @example function createMessageElement(message) {
                return (`
                            <div class="message-popup-container"></div>
                            <div class="message-panel">
                                <div class="message-author">${message.username}</div>
                                <div class="message-delete">${message.lifetime}</div>
                                <button class="message-control"></button>
                            </div>
                            <p class="message-text">${message.text}</p>
                            <time>${message.timestamp}</time>
                        `)
    }
*/

export function createMessageElement(message) {
    return (`
                <div class="message-popup-container removable"></div>
                <div class="message-panel">
                    <div class="message-author">${message.username}</div>
                    <div class="message-delete">${message.lifetime}</div>
                    <button class="message-control removable"></button>
                </div>
                <p class="message-text">${message.text}</p>
                <time class="removable">${message.timestamp}</time>
            `)
}