import { createMessageElement } from "./components/message-element-layout.js";
import { createMessagePopup } from "./components/message-popup-layout.js";
import { createChatLable } from "./components/header-chat-lable-layout.js";
import { createToggleBtn } from "./components/toggle-button-layout.js";
import { createChatOptionsBtn } from "./components/chat-options-btn-layout.js";
import { 
    template1,
    template2,
} from "./layout.js";
import {
    hideEscPopup,
    removeEscPopupListener,
    showElement,
} from "../js/utils/utils.js";

export {

    //рендер
    createMessageElement,
    createMessagePopup,
    createChatLable,
    createToggleBtn,
    createChatOptionsBtn,

    //функции общего назначения
    hideEscPopup,
    removeEscPopupListener,
    showElement,

    //элементы разметки
    template1,
    template2,
}