<div class="login fixed-overlay">
    <div class="container">
        <form class="login__form">
            <img class="login__logo" src="<?php echo $app::asset("/logo.png", null, JPI_CORE_ROOT . "/assets"); ?>" />

            <div class="input-group">
                <label for="username" class="visually-hidden">Username</label>
                <input type="text" class="input" id="username" placeholder="Username" tabindex="1" oninput="jpi.helpers.checkInput(this);" autofocus />
            </div>
            <div class="input-group">
                <label for="password" class="visually-hidden">Password</label>
                <input type="password" class="input" id="password" placeholder="Password" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
            </div>
            <p class="feedback feedback--error login__feedback"></p>
            <button type="submit" class="btn login__submit">Log In</button>
        </form>
    </div>
</div>
