import {
    createMessageElement,
    createMessagePopup,
    createChatLable,
    createToggleBtn,
    createChatOptionsBtn,
    template1,
    template2,
} from "./main.js";

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
const SYSTEM_USER = "System";
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
    const existingMessages = Array.from(container.querySelectorAll('.message')).reduce((acc, el) => {
        acc[el.dataset.messageId] = el;
        return acc;
    }, {});

    // Обрабатываем все сообщения с сервера
    messages.forEach((message, index) => {
        const msgId = message.id.toString();

        if (existingMessages[msgId]) {
            // Уже есть сообщение — проверяем, нужно ли обновлять текст
            const existingMsgEl = existingMessages[msgId];
            const messageTextEl = existingMsgEl.querySelector(".has-text");
            if (messageTextEl && messageTextEl.textContent !== message.text) {
                messageTextEl.innerHTML = message.text;
            }
            // Можно добавить проверки для другого содержимого / классов
        } else {
            // Новое сообщение — создаём и добавляем
            const messageElement = document.createElement("article");
            messageElement.className = "message fr-view";
            messageElement.dataset.messageId = message.id;
            if (index % 2 !== 0) messageElement.classList.add("odd-numbered");
            messageElement.innerHTML = createMessageElement(message);

            // Проверка на системное сообщение
            if (message.username === SYSTEM_USER) {
                messageElement.querySelectorAll(".removable").forEach(item => item.remove());
                messageElement.querySelector(".message-text")
                    .classList.remove("message-text");
                messageElement.classList.add("message-system-text");
                messageElement.classList.remove("odd-numbered");
                messageElement.classList.add("system-message");
            }

            // Старт таймера удаления
            startCountdown(messageElement, message);

            container.appendChild(messageElement);
        }
    });

    // Очищаем сообщения, которых больше нет (удаляем)
    Object.keys(existingMessages).forEach(id => {
        if (!messages.some(m => m.id.toString() === id)) {
            existingMessages[id].remove();
        }
    });

    // Добавить класс для непустых параграфов
    document.querySelectorAll("p").forEach(p => {
        if (p.textContent.trim() !== "") {
            p.classList.add("has-text");
        }
    });
}

// вспомогательная функция для таймера
function startCountdown(messageElement, message) {
    const countdownDiv = messageElement.querySelector('.message-delete');
    if (!countdownDiv) return;
    let lifetime = message.lifetime;
    const timerInterval = setInterval(() => {
        lifetime--;
        if (lifetime <= 0) {
            clearInterval(timerInterval);
            messageElement.remove();
        } else {
            countdownDiv.textContent = lifetime;
        }
    }, 1000);
}

let previousMessages = [];

function getMessages(container, cb) {
    fetch("http://localhost:4000/messages", {
        method: "GET",
    })
    .then(res => {
        if (res.status !== 200) throw new Error("Couldn't get messages from server");
        return res.json();
    })
    .then(messagesList => {
        // сравним старый и новый список (у вас есть previousMessages)
        if (JSON.stringify(messagesList) !== JSON.stringify(previousMessages)) {
            previousMessages = messagesList; // обновляем
            renderMessages(messagesList, container);
        }
    })
    .catch(error => {
        console.error(error);
        document.querySelector('.form-submit-info').textContent = error;
    })
    .finally(() => {
        setTimeout(() => getMessages(container, cb), 3000);
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

                const formContainer = document.querySelector("form");

                toggleProperty(formContainer, "overlay");
                toggleProperty(formContainer, "underlay");
                toggleProperty(formContainer, "show");
                toggleProperty(formContainer, "hidden");

                toggleProperty(container, "overlay");
                toggleProperty(container, "underlay");

                getMessages(container, scrollToBottom);
            })
            .catch(function (error) {
                formSubmitInfo.textContent = error;
                console.error(error);
            });

    }
}

function editMessage(messageId, newText) {
    fetch(`http://localhost:4000/messages/${messageId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newText }),
    })
        .then(function (response) {
            if (response.status !== 200) {
                throw new Error("Couldn't update the message");
            }

            return response.json();
        })

        .catch(function (error) {
            console.error(error);
        });
}

function deleteMessage(messageId) {
    fetch(`http://localhost:4000/messages/${messageId}`, {
        method: "DELETE",
    })
        .then(function (response) {
            if (response.status !== 200) {
                throw new Error("Couldn't delete the message");
            }

            return response.json();
        })
        .catch(function (error) {
            console.error(error);
        });
}

function initChat(container) {
    const formContainer = document.querySelector("form");
    const loginName = formContainer.querySelector("input");
    initApp();

    if (username === null || username === FAKE_USER) {
        loginName.value = FAKE_USER;
        localStorage.setItem(USERNAME_REC, FAKE_USER);
    } 
    loginName.value = initApp();
    
    // Запускаем getMessages каждые 3 секунды
    getMessages(container, scrollToBottom);
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
    if (localStorage.getItem(USERNAME_REC)) { 
        localStorage.removeItem(USERNAME_REC);
    }
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

function toggleProperty(element, classprop) {
    element.classList.toggle(classprop);
}


function toggleBtnLogic() {
    if (currentElement && currentElement.id === "element1") {

        showElement(template2, main);
        var editor = new FroalaEditor('#example');

        const chatContainer = document.querySelector(".messages");

        mode = "chat";

        if (chatContainer) {
            initChat(chatContainer);
            getMessages(chatContainer, scrollToBottom);

            chatContainer.addEventListener("click", function(event) {
                if (event.target.classList.contains("delete-control-btn")) {
                    const messageArticle = event.target.closest("article");
                    if (messageArticle) {
                        const messageId = messageArticle.dataset.messageId;
                        messageArticle.remove();
                        deleteMessage(messageId);
                    }
                }
            });

            // В обработчике клика на кнопку редактирования
            chatContainer.addEventListener("click", function (event) {
                if (event.target.classList.contains("edit-control-btn")) {
                    const messageArticle = event.target.closest("article");
                    const messageArticleText = messageArticle.querySelector(".has-text");
                    const messageId = messageArticle.dataset.messageId;
                    const newText = prompt("Enter new text:");
                    if (newText) {
                        messageArticleText.textContent = newText;
                        editMessage(messageId, newText);
                    }
                }
            });

            const toggleMenuChatBtn = document.querySelector(".toggle-menu-chat-btn");
            const formContainer = document.querySelector("form");

            if (toggleMenuChatBtn) {
                
                toggleMenuChatBtn.addEventListener("click", () => {
                    toggleProperty(formContainer, "overlay");
                    toggleProperty(formContainer, "underlay");
                    toggleProperty(formContainer, "show");
                    toggleProperty(formContainer, "hidden");
    
                    toggleProperty(chatContainer, "overlay");
                    toggleProperty(chatContainer, "underlay");
                });
            }


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

