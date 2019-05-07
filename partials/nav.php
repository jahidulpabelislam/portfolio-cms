<?php
if (!defined("ROOT")) {
    die();
}
?>

        <!-- The navigation used on site -->
        <nav class="nav" ng-show="isLoggedIn">
            <div class="container nav__container">
                <div class="nav__header">
                    <button type="button" class="nav__mobile-toggle">
                        <span class="screen-reader-text">Toggle navigation</span>
                        <span class="menu-bar menu-bar--top"></span>
                        <span class="menu-bar menu-bar--middle"></span>
                        <span class="menu-bar menu-bar--bottom"></span>
                    </button>
                </div>
                <div class="nav__links-container">
                    <ul class="nav__links clearfix">
                        <li class="nav-link__item">
                            <a href="/projects/1/" title="Link to Projects Page" class="nav-item__link js-projects" tabindex="2">
                                <span class="screen-reader-text">Projects</span>
                                <i class="fa fa-list-ul"></i>
                            </a>
                        </li>
                        <li class="nav-link__item">
                            <a href="/project/new/" title="Link to New Project Form Page" class="nav-item__link js-new-project" tabindex="2">
                                <span class="screen-reader-text">Add A Project</span>
                                <i class="fa fa-plus"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="nav__links-container nav__links-container--left">
                    <ul class="nav__links clearfix">
                        <li class="nav-link__item">
                            <a href="/logout/" title="Link to Logout Page" class="nav-item__link js-logout" tabindex="2">
                                <span class="screen-reader-text">Logout</span>
                                <i class="fa fa-times-circle"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
