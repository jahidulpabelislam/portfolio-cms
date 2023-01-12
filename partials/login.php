<div class="login fixed-overlay">
    <div class="container">
        <form class="login__form">
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" class="input" id="username" placeholder="myusername" tabindex="1" oninput="jpi.helpers.checkInput(this);" autofocus />
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" class="input" id="password" placeholder="mypassword" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
            </div>
            <p class="feedback feedback--error login__feedback"></p>
            <button type="submit" class="btn btn--dark-green login__submit">Log in</button>
        </form>
    </div>
</div>
