/**
    @example function createMessagePopup() {
            return (`
                        <div class="message-popup">
                            <div class="message-management-block">
                                <div class="close-block">
                                    <button class="view-control-btn control-btn">View</button>
                                    <button class="close-control-btn">X</button>
                                </div>
                                <button class="edit-control-btn control-btn">Edit</button>
                                <button class="delete-control-btn control-btn">Delete</button>
                            </div>
                            <div class="message-info-block">
                                <button class="item-control-btn control-btn">Item</button>
                            </div>
                        </div>
                    `)
    }
*/

export function createMessagePopup() {
    return (`
                <div class="message-popup">
                    <div class="message-management-block">
                        <div class="close-block">
                            <button class="view-control-btn control-btn">View</button>
                            <button class="close-control-btn">X</button>
                        </div>
                        <button class="edit-control-btn control-btn">Edit</button>
                        <button class="delete-control-btn control-btn">Delete</button>
                    </div>
                    <div class="message-info-block">
                        <button class="item-control-btn control-btn">Item</button>
                    </div>
                </div>
            `)
}