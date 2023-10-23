<nav class="nav">
    <div class="nav__toggle-container">
        <button type="button" class="nav__toggle">
            <span class="visually-hidden">Toggle navigation</span>
            <span class="nav__toggle-bar"></span>
            <span class="nav__toggle-bar"></span>
            <span class="nav__toggle-bar"></span>
        </button>
    </div>
    <ul class="nav__links">
        <li class="nav__item">
            <a class="nav__link js-link-projects" href="/projects/1/" title="Link to Projects Listing" tabindex="2">
                <span class="material-symbols-outlined">list_alt</span>
                <span>Projects</span>
            </a>
        </li>
        <li class="nav__item">
            <a class="nav__link js-link-new-project" href="/project/new/" title="Link to Add Project" tabindex="2">
                <span class="material-symbols-outlined">list_alt_add</span>
                <span>Add A Project</span>
            </a>
        </li>
        <li class="nav__item">
            <a class="nav__link js-logout" href="/logout/" title="Button to Logout" tabindex="2">
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </a>
        </li>
    </ul>
    <div class="nav__footer">
        <img class="nav__logo" src="/assets/images/jpi.png" />
        <p>&copy; Jahidul Pabel Islam 2010 - <?php echo date("Y"); ?></p>
    </div>
</nav>
