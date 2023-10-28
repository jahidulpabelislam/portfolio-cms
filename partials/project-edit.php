<div class="project-edit clearfix">
    <form class="project-edit__form clearfix">
        <div class="project-edit__header">
            <p class="project-edit__feedback feedback hide">
                <span></span>
                <button type="button" class="project-edit__hide-error">X</button>
            </p>
            <div class="project-edit__header-buttons">
                <a class="btn btn--orange project-edit__back-button js-link-projects" href="/projects/" title="Link to Projects Page" tabindex="1">
                    <span class="material-symbols-outlined">chevron_left</span>
                    <span class="">Back</span>
                </a>

                <button type="submit" class="btn btn--dark-green project-edit__save-button" tabindex="1">
                    <span>Save</span>
                </button>
            </div>
            <div class="input-group">
                <label for="project-name" class="visually-hidden">Name</label>
                <input type="text" name="project-name" id="project-name" class="input project-edit__name" placeholder="Portfolio" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
            </div>
        </div>

        <div class="project-edit__sidebar clearfix">
            <div class="project-edit__sidebar-block">
                <label for="tag-input">Tags:</label>

                <div class="js-project-edit-tags"></div>

                <div class="project-edit__tag-input-container">
                    <label for="tag-input" class="visually-hidden">Add tags for project.</label>
                    <input type="text" class="input project-edit__tag-input" id="tag-input" placeholder="HTML5" tabindex="1" />
                    <button type="button" class="btn btn--dark-blue project-edit__tag-add-button" id="tag-add" tabindex="1">
                        <span class="visually-hidden">Add</span>
                        <span class="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>

            <div class="project-edit__sidebar-block">
                <p class="project-edit__meta-item project-edit__meta-item--dates"><strong>Created at:</strong> <span class="js-project-created-at"></span></p>
                <p class="project-edit__meta-item project-edit__meta-item--dates"><strong>Updated at:</strong> <span class="js-project-updated-at"></span></p>
            </div>

            <div class="project-edit__sidebar-block">
                <div class="project-edit__meta-item">
                    <span class="label">Published?</span>
                    <label class="radio-toggle">
                        <input type="checkbox" name="project-is-published" id="project-is-published" class="visually-hidden">
                        <span class="radio-toggle__toggle"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="project-edit__main">
            <div class="project-edit__tabs-bar">
                <button type="button" class="project-edit__tabs-bar-item project-edit__tabs-bar-item--active">Setup</button>
                <button type="button" class="project-edit__tabs-bar-item">Copy</button>
                <button type="button" class="project-edit__tabs-bar-item">Imagery</button>
            </div>

            <div class="project-edit__tabs-contents">
                <div class="project-edit__tabs-content project-edit__tabs-content--active">
                    <div class="input-group">
                        <label for="project-type">Type:</label>
                        <input type="text" name="project-type" id="project-type" class="input project-edit__type" placeholder="Web App" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
                    </div>

                    <div class="input-group">
                        <label for="project-date">Date:</label>
                        <input type="date" name="project-date" id="project-date" class="input project-edit__date" placeholder="2016-01-30" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
                    </div>

                    <div class="input-group">
                        <label for="project-colour">Colour <span>(optional)</span>:</label>
                        <select name="project-colour" id="project-colour" class="input project-edit__colour" tabindex="1">
                            <?php
                            foreach ($colourOptions as $value => $display) {
                                echo "<option value='$value'>$display</option>";
                            }
                            ?>
                        </select>
                    </div>

                    <div class="input-group">
                        <label for="project-url">URL <span>(optional)</span>:</label>
                        <input type="text" name="project-url" id="project-url" class="input project-edit__url" placeholder="https://jahidulpabelislam.com/" tabindex="1" />
                    </div>

                    <div class="input-group">
                        <label for="project-github-url">GitHub <span>(optional)</span>:</label>
                        <input type="url" name="project-github-url" id="project-github-url" class="input project-edit__github" placeholder="http://github.com/jahidulpabelislam/portfolio/" tabindex="1" />
                    </div>

                    <div class="input-group">
                        <label for="project-download-url">Download <span>(optional)</span>:</label>
                        <input type="text" name="project-download-url" id="project-download-url" class="input project-edit__download" placeholder="https://github.com/jahidulpabelislam/portfolio/archive/v4.zip" tabindex="1" />
                    </div>
                </div>

                <div class="project-edit__tabs-content">
                    <div class="input-group">
                        <label for="project-short-desc">Short Description:</label>
                        <textarea name="project-short-desc" id="project-short-desc" class="project-edit__short-desc" tabindex="1"></textarea>
                    </div>

                    <div class="input-group">
                        <label for="project-long-desc">Long Description:</label>
                        <textarea name="project-long-desc" id="project-long-desc" class="project-edit__long-desc" tabindex="1"></textarea>
                    </div>
                </div>
                <div class="project-edit__tabs-content">
                    <ul class="project-edit__images"></ul>

                    <div class="project-edit__image-drop-zone">
                        <p class="project-edit__image-drop-zone-text">
                            <label class="project-edit__faux-image-upload" for="project-image-upload">Choose</label> or Drop Image(s) Here To Upload for Project
                        </p>

                        <input type="file" id="project-image-upload" class="input project-edit__image-upload" multiple accept="image/*" tabindex="1" />
                    </div>

                    <ul class="project-edit__uploads"></ul>
                </div>
            </div>
        </div>
    </form>
</div>

<script type="text/template" id="js-project-edit-image-template">
    <li class="project-edit__image-container">
        <input type="hidden" class="js-project-edit-image" name="images[]" value="{{ id }}">
        <img class="project-edit__image" src="{{ url }}" />
        <button type="button" class="btn btn--red project-edit__image-delete-button" data-id="{{ id }}" tabindex="1">
            <span class="material-symbols-outlined">delete</span>
        </button>
    </li>
</script>

<script type="text/template" id="js-project-edit-image-upload-success-template">
    <li class="project-edit__image-container">
        <img src="{{ url }}" alt="{{ name }}" />
        <button type="button" class="btn btn--dark-blue js-project-image-upload-button" data-index="{{ index }}" tabindex="1">
            <span class="visually-hidden">Upload This Image</span>
            <span class="material-symbols-outlined">upload</span>
        </button>
    </li>
</script>

<script type="text/template" id="js-project-edit-image-upload-error-template">
    <div class="project-edit__upload project-edit__upload--failed"><p>{{ error }}</p></div>
</script>
