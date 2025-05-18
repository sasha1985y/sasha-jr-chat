import {
    createMessageElement,
    createMessagePopup,
    createChatLable,
    createToggleBtn,
    createChatOptionsBtn,
    template1,
    template2,
} from "./main.js";

//const template1 = document.getElementById("template1");
//const template2 = document.getElementById("template2");
const toggleButton = document.getElementById("toggle-button");
const main = document.querySelector("main");
const headerChatLable = document.querySelector(".header-chat-lable");
const headerChatManager = document.querySelector(".header-chat-manager");
const modeIndex = document.querySelector(".mode-index");

let currentElement = null;
let mode = "";
headerChatLable.innerHTML = "";

const USERNAME_REC = "username";
const FAKE_USER = "Anonimous user";
let username = null;

function showElement(template, container) {

    if (currentElement) {
        currentElement.remove();
    }

    currentElement = template.content.cloneNode(true).firstElementChild;
    container.innerHTML = "";
    container.appendChild(currentElement);
}

function renderMessages(messages, container) {
    let index = 0;
    for (const message of messages) {
        const messageElement = document.createElement("article");
        messageElement.className = "message";

        if (index % 2 !== 0) {
            messageElement.classList.add("odd-numbered");
        }

        if (username === FAKE_USER) {
            message.username = FAKE_USER;
        }

        messageElement.innerHTML = createMessageElement(message);
        if (container) {
            container.appendChild(messageElement);
        }
        index++;
    }
}

function getMessages(container, cb) {
    const formSubmitInfo = document.querySelector(".form-submit-info");
    fetch("http://localhost:4000/messages", {
        method: "GET",
    })
        .then(function (messagesResponse) {
            if (messagesResponse.status !== 200) {
                throw new Error("Couldn't get messages from server");
            }

            return messagesResponse.json();
        })
        .then(function (messagesList) {
            console.log(messagesList);
            renderMessages(messagesList, container);
        })
        .catch(function (error) {
            console.error(error);
            formSubmitInfo.textContent = error;
        });

        if (typeof cb === "function") {
          cb();
        }
}

function scrollToBottom(container) {
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function initForm(container) {
    const formContainer = document.querySelector("form");
    const formTextField = formContainer.querySelector("textarea");
    const formSubmitButton = formContainer.querySelector("button");
    const formSubmitInfo = document.querySelector(".form-submit-info");

    formContainer.onsubmit = function (evt) {
        evt.preventDefault();

        console.log(`username: ${username}`);
        const formData = new FormData(evt.target);

        const messageData = {
            username: formData.get("username"),
            text: formData.get("text"),
        };

        formTextField.disabled = true;
        formSubmitButton.disabled = true;
        formSubmitInfo.textContent = "Сообщение отправляется...";

        fetch("http://localhost:4000/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
        })
            .then(function (newMessageResponse) {
                console.log(newMessageResponse.status);

                if (newMessageResponse.status !== 200) {
                    //
                }

                formTextField.disabled = false;
                formTextField.value = "";
                formSubmitButton.disabled = false;
                formSubmitInfo.textContent = "";

                container.innerHTML = "";
                getMessages(container, scrollToBottom);
            })
            .catch(function (error) {
                formSubmitInfo.textContent = error;
                console.error(error);
            });

    }
}

function initChat(container) {
    const formContainer = document.querySelector("form");
    const loginName = formContainer.querySelector("input");
    initApp();

    if (username === null || username === FAKE_USER) {
        loginName.value = FAKE_USER;
        localStorage.setItem(USERNAME_REC, FAKE_USER);

    } loginName.value = initApp();
    
    getMessages(container, scrollToBottom);
    setInterval(getMessages, 3000);
    initForm(container);
}

function initUsernameForm() {
    const usernameContainer = document.querySelector(".username");
    const usernameForm = usernameContainer.querySelector("form");
    
    
    usernameForm.onsubmit = function (evt) {
        evt.preventDefault();
        
        const formElement = evt.target;
        const formData = new FormData(formElement);
        const enteredUsername = formData.get("username");
        
        localStorage.setItem(USERNAME_REC, enteredUsername);
        
        usernameContainer.close();
        usernameForm.onsubmit = null;
    };
    
    usernameContainer.showModal();
}

function initApp() {
    username = localStorage.getItem(USERNAME_REC);
    if (username === null && mode === "greeting") {
        initUsernameForm();
        return;
    } return username;
}

// При загрузке страницы показываем первый элемент
window.onload = () => {
    showElement(template1, main);
    mode = "greeting";
    modeIndex.textContent = mode;
    initApp();
};

function goGreetingMenu() {
    showElement(template1, main);
    mode = "greeting";
    headerChatLable.innerHTML = "";
    modeIndex.textContent = mode;
    headerChatManager.innerHTML = createToggleBtn();
    const toggleButton = document.getElementById("toggle-button");
    toggleButton.addEventListener("click", toggleBtnLogic);
}

function toggleBtnLogic() {
    if (currentElement && currentElement.id === "element1") {

        showElement(template2, main);

        const chatContainer = document.querySelector(".messages");

        mode = "chat";

        if (chatContainer) {
            initChat(chatContainer);
            chatContainer.addEventListener("click", function(event) {

                if (event.target.classList.contains("message-control")) {

                    const messageArticle = event.target.closest("article");
                    const popupContainer = messageArticle.querySelector(".message-popup-container");
                    
                    if (popupContainer) {

                        const messagePopup = createMessagePopup();

                        chatContainer.querySelectorAll(".contains-popup").forEach(place => {
                            place.innerHTML = "";
                            popupContainer.innerHTML = messagePopup;
                        })
                        
                        function clearPopupContainer() {
                            popupContainer.innerHTML = "";
                        }
                        
                        if (messagePopup) {
                            popupContainer.classList.add("contains-popup");
                            const closeControlBtn = document.querySelector(".close-control-btn");
                            if (closeControlBtn) {
                                closeControlBtn.addEventListener("click", clearPopupContainer);
                            }
                        }

                    }

                }
            });
        }


        headerChatLable.innerHTML = createChatLable();
        modeIndex.textContent = mode;

        toggleButton.remove();

        headerChatManager.innerHTML = createChatOptionsBtn();

        const chatOptionsBtn = document.getElementById("chat-options-button");
        const chatOptionsContent = document.querySelector(".chat-options-content");

        //логика перехода обратно к template1
        if (chatOptionsBtn && chatOptionsContent) {
            const toggleButton = document.getElementById("toggle-button");
            const logoutButton = document.getElementById("logout-button");

            toggleButton.addEventListener("click", () => {
                goGreetingMenu();
                const usernameContainer = document.querySelector(".username");
                usernameContainer.showModal();
                const usernameInput = document.getElementById("username");
                usernameInput.value = initApp();
                localStorage.removeItem(USERNAME_REC);
                initUsernameForm();
            });

            logoutButton.addEventListener("click", () => {
                goGreetingMenu();
                localStorage.removeItem(USERNAME_REC);
                initApp();
            });

            //2 способа закрытия управляющего попапа приложения
        
            function hideOptionsContent(evt) {
                if (evt.target !== chatOptionsContent) {
                    chatOptionsContent.classList.add("hidden");
                    toggleButton.disabled = true;
                    logoutButton.disabled = true;
                }
            }

            if (chatOptionsContent.classList.contains("hidden")) {
                main.addEventListener("click", hideOptionsContent);
            }

            function toggleOptionsContent() {
                chatOptionsContent.classList.toggle("hidden");
                toggleButton.toggleAttribute("disabled");
                logoutButton.toggleAttribute("disabled");
            }

            chatOptionsBtn.addEventListener("click", toggleOptionsContent);
        }

    } else {

        showElement(template1, main);

        mode = "greeting";

        headerChatLable.innerHTML = "";
        modeIndex.textContent = mode;

        headerChatManager.innerHTML = createToggleBtn();
        toggleButton.addEventListener("click", toggleBtnLogic);
    }
}

toggleButton.addEventListener("click", toggleBtnLogic);

