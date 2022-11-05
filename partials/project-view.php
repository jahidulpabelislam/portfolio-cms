<div class="project-view clearfix">
    <p class="project__feedback feedback hide">
        <span></span>
        <button type="button" class="project__hide-error">X</button>
    </p>

    <a class="btn btn--orange project__back-button js-link-projects" href="/projects/" title="Link to Projects Page" tabindex="1">
        <span class="screen-reader-text">Back</span>
        <i class="fas fa-arrow-circle-left"></i>
    </a>

    <form class="project__form clearfix">
        <div class="project__sidebar clearfix">
            <div class="project__sidebar-block">
                <div class="project__meta-item">
                    <label for="project-status">Status: <span class="required">*</span></label>
                    <select name="project-status" id="project-status" class="input input--inline project__status" tabindex="1">
                        <?php
                        $statusOptions = [
                            "" => "Please Select",
                            "draft" => "Draft",
                            "private" => "Private",
                            "published" => "Published",
                        ];
                        foreach ($statusOptions as $value => $display) {
                            echo "<option value='{$value}'>{$display}</option>";
                        }
                        ?>
                    </select>
                </div>

                <div class="project__meta-item">
                    <label for="project-colour">Colour: </label>
                    <select name="project-colour" id="project-colour" class="input input--inline project__colour" tabindex="1">
                        <?php
                        $colourOptions = [
                            "" => "Default",
                            "light-blue" => "Light Blue",
                            "dark-blue" => "Dark Blue",
                            "purple" => "Purple",
                            "pink" => "Pink",
                            "red" => "Red",
                            "orange" => "Orange",
                            "yellow" => "Yellow",
                            "light-green" => "Light Green",
                            "lime-green" => "Lime Green",
                            "dark-green" => "Dark Green",
                            "grey" => "Grey",
                            "black" => "Black",
                        ];
                        foreach ($colourOptions as $value => $display) {
                            echo "<option value='$value'>$display</option>";
                        }
                        ?>
                    </select>
                </div>

                <div class="project__meta-item">
                    <label for="project-date">Date: <span class="required">*</span></label>
                    <input type="date" name="project-date" id="project-date" class="input input--inline project__date" placeholder="2016-01-30" tabindex="1" oninput="jpi.helpers.checkInput(this);" />
                </div>

                <div class="project__meta-item project__meta-item--dates">
                    <p><strong>Created at:</strong> <span class="js-project-created-at"></span></p>
                    <p><strong>Updated at:</strong> <span class="js-project-updated-at"></span></p>
                </div>
            </div>

            <div class="project__sidebar-block">
                <label for="tag-input">Tags: <span class="required">*</span></label>

                <div class="js-project-view-tags"></div>

                <div class="project__tag-input-container">
                    <label for="tag-input" class="screen-reader-text">Add tags for project.</label>
                    <input type="text" class="input project__tag-input" id="tag-input" placeholder="HTML5" tabindex="1" />
                    <button type="button" class="btn btn--dark-green project__tag-add-button" id="tag-add" tabindex="1">
                        <span class="screen-reader-text">Add</span>
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="project__main">
            <label for="project-name">Name: <span class="required">*</span></label>
            <input type="text" name="project-name" id="project-name" class="input project__name" placeholder="Portfolio" tabindex="1" oninput="jpi.helpers.checkInput(this);" />

            <label for="project-type">Type: <span class="required">*</span></label>
            <input type="text" name="project-type" id="project-type" class="input project__type" placeholder="Web App" tabindex="1" oninput="jpi.helpers.checkInput(this);" />

            <label for="project-url">URL:</label>
            <input type="text" name="project-url" id="project-url" class="input project__url" placeholder="https://jahidulpabelislam.com/" tabindex="1" />

            <label for="project-github-url">GitHub:</label>
            <input type="url" name="project-github-url" id="project-github-url" class="input project__github" placeholder="http://github.com/jahidulpabelislam/portfolio/" tabindex="1" />

            <label for="project-download-url">Download:</label>
            <input type="text" name="project-download-url" id="project-download-url" class="input project__download" placeholder="https://github.com/jahidulpabelislam/portfolio/archive/v4.zip" tabindex="1" />

            <label for="project-short-desc">Short Description: <span class="required">*</span></label>
            <textarea name="project-short-desc" id="project-short-desc" class="project__short-desc" tabindex="1"></textarea>

            <label for="project-long-desc">Long Description: <span class="required">*</span></label>
            <textarea name="project-long-desc" id="project-long-desc" class="project__long-desc" tabindex="1"></textarea>

            <button type="submit" class="btn btn--dark-green project__save-button" tabindex="1">
                <span class="screen-reader-text"></span>
                <i class="fa fa-upload"></i>
            </button>
        </div>

        <div class="project__sidebar clearfix">
            <div class="project__sidebar-block">
                <ul class="project__images"></ul>
            </div>

            <div class="project__sidebar-block project__image-drop-zone">
                <p class="project__image-drop-zone-text">
                    <label class="project__faux-image-upload" for="project-image-upload">Choose</label> or Drop Image(s) Here To Upload for Project
                </p>

                <input type="file" id="project-image-upload" class="input project__image-upload" multiple accept="image/*" tabindex="1" />
            </div>

            <div class="project__sidebar-block">
                <div class="project__uploads"></div>
            </div>
        </div>
    </form>
</div>

<script type="text/template" id="js-project-show-image-template">
    <li class="project__image-container">
        <input type="hidden" class="js-project-view-image" name="images[]" value="{{ id }}">
        <img class="project__image" src="{{ url }}" />
        <button type="button" class="btn btn--red project__image-delete-button" data-id="{{ id }}" tabindex="1">X</button>
    </li>
</script>

<script type="text/template" id="js-project-show-image-upload-success-template">
    <div class="project__upload project__upload--success">
        <p>{{ name }}</p>
        <img src="{{ url }}" alt="{{ name }}" />
        <button type="button" class="btn btn--dark-blue js-project-image-upload-button" data-index="{{ index }}" tabindex="1">
            <span class="screen-reader-text">Upload This Image</span>
            <i class="fa fa-upload"></i>
        </button>
    </div>
</script>

<script type="text/template" id="js-project-show-image-upload-error-template">
    <div class="project__upload project__upload--failed"><p>{{ error }}</p></div>
</script>
