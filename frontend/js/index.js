
import {
    createMessageElement,
    createMessagePopup,
    createChatLable,
    createToggleBtn,
    createChatOptionsBtn,
} from "./main.js";

const template1 = document.getElementById("template1");
const template2 = document.getElementById("template2");
const toggleButton = document.getElementById("toggle-button");
const main = document.querySelector("main");
const headerChatLable = document.querySelector(".header-chat-lable");
const headerChatManager = document.querySelector(".header-chat-manager");
const modeIndex = document.querySelector(".mode-index");

let currentElement = null;
let mode = "";
headerChatLable.innerHTML = "";

function renderMessages(messages, container) {
    let index = 0;

/**
 * Требования:
 * - Прозрачная обратная связь — в любой момент времени пользователь
 *   должен понимать что происходит с интерфейсомы
 *   - Можно ли писать текст сообщения?
 *   - Валидно ли сообщение, которое он отправляет и можно ли его отправить?
 *   - После отправки 
 *    - началась ли отправка?
 *    - пришло ли сообщение на сервер? удачно ли?
 *    - [отображение сообщения в списке]
 * 
 * 1. Я нажал на кнопку отправить
 * 2. На сервер ушел POST-запрос
 * 3. Сервер обработал этот запрос
 * 4. Вернул мне ответ
 * 5. Я обработал ответ, понял есть ли ошибка
 * 6. Если нет ошибки — показал это
 * 6.1 Если есть ошибка — показал это
 * 
 * Хорошо бы дать возможность пользователю не отправлять одно и то же сообщение
 * несколько раз
 * 
 * Способы обратной связи 
 * 1. Ничего не делать
 * 2. Все заблокировать
 *   1. Заблокировать поле ввода и кнопку и поменять текст на кнопке
 *   2. Если удачно — разблокировать и вернуть текст обратно, очистить форму и отобразить обновленный список сообщений
 *   3. Если ошибка — разблокировать и вернуть текст обратно, не сбрасывать форму и показать ошибку
 * 3. Optimistic UI
 *   1. Мгновенно обновляет список сообщений и показывает наше сообщение в списке
 *      Очищает форму и дает возможность отправить новое сообщение
 *      Вновь созданному сообщению добавляет визуальный индикатор о его состоянии
 */


{
  const container = document.querySelector(".messages");

  function renderMessages(messages) {
    container.innerHTML = "";


    for (const message of messages) {
        const messageElement = document.createElement("article");
        messageElement.className = "message";

        if (index % 2 !== 0) {
            messageElement.classList.add("odd-numbered");
        }


        messageElement.innerHTML = createMessageElement(message);

      messageElement.innerHTML = `
        <div class="message-header">
          <div class="message-author">${message.username}</div>
          <button class="message-control"></button>
        </div>
        <p class="message-text">${message.text}</p>
        <time class="message-time">${message.timestamp}</time>
      `;


        container.appendChild(messageElement);
        index++;
    }
}


function getMessages(container) {
    const formSubmitInfo = document.querySelector(".form-submit-info");

  function getMessages() {

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
}

function initForm(container) {
    const formContainer = document.querySelector("form");

    const formTextField = formContainer.querySelector("textarea");
    const formSubmitButton = formContainer.querySelector("button");
    const formSubmitInfo = document.querySelector(".form-submit-info");

    formContainer.onsubmit = function (evt) {
        evt.preventDefault();
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
                getMessages(container);
            })
            .catch(function (error) {
                formSubmitInfo.textContent = error;
                console.error(error);
            });

    }
}

function initChat(container) {
    getMessages(container);
    initForm(container);
}


function showElement(template, container) {

    if (currentElement) {
        currentElement.remove();
    }

    currentElement = template.content.cloneNode(true).firstElementChild;
    container.innerHTML = "";
    container.appendChild(currentElement);
}

// При загрузке страницы показываем первый элемент
window.onload = () => {
    showElement(template1, main);
    mode = "greeting";
    modeIndex.textContent = mode;
};

function toggleBtnLogic() {
    if (currentElement && currentElement.id === "element1") {

        showElement(template2, main);

        const container = document.querySelector(".messages");

        mode = "chat";

        if (container) {
            initChat(container);
            
            container.addEventListener("click", function(event) {

                if (event.target.classList.contains("message-control")) {

                    const messageArticle = event.target.closest("article");
                    const popupContainer = messageArticle.querySelector(".message-popup-container");
                    
                    if (popupContainer) {

                        const messagePopup = createMessagePopup();

                        container.querySelectorAll(".contains-popup").forEach(place => {
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
                showElement(template1, main);

                mode = "greeting";

                headerChatLable.innerHTML = "";
                modeIndex.textContent = mode;

                headerChatManager.innerHTML = createToggleBtn();
                const toggleButton = document.getElementById("toggle-button");
                toggleButton.addEventListener("click", toggleBtnLogic);
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

  function initForm() {
    const formContainer = document.querySelector("form");

    const formTextField = formContainer.querySelector("textarea");
    const formSubmitButton = formContainer.querySelector("button");

    formContainer.onsubmit = function(evt) {
      evt.preventDefault();
      const formData = new FormData(evt.target);

      const messageData = {
        username: formData.get("username"),
        text: formData.get("text"),
      };

      formTextField.disabled = true;
      formSubmitButton.disabled = true;
      formSubmitButton.textContent = "Сообщение отправляется...";

      fetch("http://localhost:4000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })
        .then(function(newMessageResponse) {
          console.log(newMessageResponse.status);

          if (newMessageResponse.status !== 200) {
            //
          }

          formTextField.disabled = false;
          formTextField.value = "";
          formSubmitButton.disabled = false;
          formSubmitButton.textContent = "Отправить";

          getMessages();
        });
    }
  }

  function initChat() {
    getMessages();
    initForm();
  }

  initChat();

}

toggleButton.addEventListener("click", toggleBtnLogic);

