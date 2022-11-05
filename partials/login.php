<div class="login fixed-overlay">
    <div class="container">
        <form class="login__form">
            <label for="username">Username</label>
            <input type="text" class="input" id="username" placeholder="myusername" tabindex="1" oninput="jpi.helpers.checkInput(this);" autofocus />
            <label for="password">Password</label>
            <input type="password" class="input" id="password" placeholder="mypassword" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
            <p class="feedback feedback--error login__feedback"></p>
            <button type="submit" class="btn btn--dark-green">Log In</button>
        </form>
    </div>
</div>
