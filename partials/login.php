<?php
if (!defined("ROOT")) {
    die();
}
?>

        <!-- The login area -->
        <div class="login">
            <div class="container">
                <form class="login__form" ng-submit="logIn()">
                    <label for="username">Username</label>
                    <input type="text" class="input" id="username" name="username" ng-model="username" placeholder="myusername" tabindex="1" oninput="jpi.helpers.checkInputField(this);" required autofocus />
                    <label for="password">Password</label>
                    <input type="password" class="input" id="password" name="password" ng-model="password" placeholder="mypassword" tabindex="1" oninput="jpi.helpers.checkInputField(this);" required />
                    <!-- Where the feedback will go if any error -->
                    <p class="feedback feedback--error login__feedback" ng-show="userFormFeedback">{{ userFormFeedback }}</p>
                    <button type="submit" class="btn btn--dark-green">Log In</button>
                </form>
            </div>
        </div>
