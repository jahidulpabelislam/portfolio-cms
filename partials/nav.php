<?php
if (!defined("ROOT")) {
    die();
}
?>

        <!-- The navigation used on site -->
        <nav class="nav" ng-show="isLoggedIn">
            <button type="button" class="nav__toggle">
                <span class="screen-reader-text">Toggle navigation</span>
                <span class="nav__toggle-bar"></span>
                <span class="nav__toggle-bar"></span>
                <span class="nav__toggle-bar"></span>
            </button>
            <ul class="nav__links">
                <li class="nav__item">
                    <a class="nav__link js-projects" href="/projects/1/" title="Link to Projects Page" tabindex="2">
                        <i class="fas fa-list"></i>
                        Projects
                    </a>
                </li>
                <li class="nav__item">
                    <a class="nav__link js-new-project" href="/project/new/" title="Link to New Project Form Page" tabindex="2">
                        <i class="fas fa-plus"></i>
                        Add A Project
                    </a>
                </li>
                <li class="nav__item">
                    <a class="nav__link js-logout" href="/logout/" title="Link to Logout Page" tabindex="2">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                </li>
            </ul>
        </nav>
