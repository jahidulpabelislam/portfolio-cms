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
			<input ng-model="username" type="text" name="username" id="username" placeholder="myusername" autofocus class="input" tabindex="1" oninput="jpi.helpers.checkInputField(this);" required>
			<label for="password">Password</label>
			<input ng-model="password" type="password" name="password" id="password" placeholder="mypassword" class="input" tabindex="2" oninput="jpi.helpers.checkInputField(this);" required>
			<!-- Where the feedback will go if any error -->
			<p class="feedback feedback--error login__feedback" ng-show="userFormFeedback">{{ userFormFeedback }}</p>
			<button type="submit" value="Log In" class="btn btn--green">Log In</button>
		</form>
	</div>
</div>