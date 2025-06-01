/**
    @example
    <template id="template1">
      <div id="element1" class="main-greeting-background">
        <div class="logo-container">
          <img src="./img/Logo.svg" alt="logo">
        </div>
        <h1>Online Chat</h1>
        <dialog class="username" open="true">
          <form method="POST">
            <fieldset class="auth-form-content">
              <label for="username" class="auth-label">Username</label>
              <input id="username" required type="text" name="username" placeholder="username" autocapitalize="off" autocomplete="off" class="auth-input">
            </fieldset>
            <button type="submit" class="auth-btn">Join</button>
          </form>
        </dialog>
      </div>
    </template>
*/

const template1 = document.getElementById("template1");

/**
@example
  <template id="template2">
        <section id="element2" class="main-chat-background">
          <div class="chat-options-container">
            <div class="chat-options-content hidden">
              <button type="button" id="toggle-button" class="toggle-btn" disabled>Edit name</button>
              <button type="button" id="logout-button" class="logout-btn" disabled>Logout</button>
            </div>
          </div>
          <section class="messages overlay"></section>
          <form action="/" method="POST" class="message-input underlay hidden">
            <input type="hidden" name="username"/>
            <textarea id="example" name="text" placeholder="Write a message..." class="input-content"></textarea>
            <button class="submit-message"></button>
          </form>
          <div class="toggle-menu-chat-container">
            <div class="form-submit-info"></div>
            <button type="button" class="toggle-menu-chat-btn"></button>
          </div>
        </section>
      </template>
*/

const template2 = document.getElementById("template2");

export {
  template1,
  template2,
}