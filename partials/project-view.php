<?php
if (!defined("ROOT")) {
    die();
}
?>

                <div class="project-view clearfix" ng-show="isLoggedIn">
                    <p class="feedback project__feedback hide">
                        <span>{{ projectFormFeedback }}</span>
                        <button type="button" class="project__hide-error" ng-click="hideProjectFeedback()">X</button>
                    </p>

                    <a class="btn btn--orange project__back-button js-projects" href="/projects/" title="Link to Projects Page" tabindex="1">
                        <span class="screen-reader-text">Back</span>
                        <i class="fas fa-arrow-circle-left"></i>
                    </a>

                    <form id="projectForm" class="project__form clearfix" ng-submit="checkAuthStatus(submitProject)">

                        <div class="project__sidebar clearfix">
                            <div class="project__sidebar-block">
                                <div class="project__meta-item">
                                    <label for="project-status">Status: <span class="required">*</span></label>
                                    <select ng-model="selectedProject.status" name="project-status" id="project-status" class="input input--inline project__status" tabindex="1" required>
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
                                    <label for="project-colour">Colour:</label>
                                    <select ng-options="colour as colourName for (colour, colourName) in colourOptions" ng-model="selectedProject.colour" name="project-colour" id="project-colour" class="input input--inline project__colour" tabindex="1">
                                    </select>
                                </div>

                                <div class="project__meta-item">
                                    <label for="project-date">Date:<span class="required">*</span></label>
                                    <input ng-model="selectedProject.date" type="date" name="project-date" id="project-date" class="input input--inline project__date" placeholder="2016-01-30" tabindex="1" oninput="jpi.helpers.checkInput(this);" required />
                                </div>

                                <div class="project__meta-item project__meta-item--dates" ng-if="selectedProject && selectedProject.id">
                                    <p><strong>Created at:</strong> {{ selectedProject.created_at|date:'EEE d MMM y h:mma' }}</p>
                                    <p><strong>Updated at:</strong> {{ selectedProject.updated_at|date:'EEE d MMM y h:mma' }}</p>
                                </div>
                            </div>

                            <div class="project__sidebar-block">
                                <label for="skill-input">Skills: <span class="required">*</span></label>

                                <div ng-model="selectedProject.skills" ui-sortable class="ui-state-default">
                                    <p ng-repeat="skill in selectedProject.skills track by $index" class="project__skill project__skill--{{ selectedProject.colour }}">{{ skill }}
                                        <button type="button" class="btn project__skill-delete-button" ng-click="deleteSkill(skill)" tabindex="1">x</button>
                                    </p>
                                </div>

                                <div class="project__skill-input-container">
                                    <label for="skill-input" class="screen-reader-text">Add skills for project.</label>
                                    <input ng-model="skillInput" type="text" class="input project__skill-input" id="skill-input" placeholder="HTML5" tabindex="1" />
                                    <button type="button" class="btn btn--dark-green project__skill-add-button" type="button" id="skill-add" ng-click="addSkill()" tabindex="1">
                                        <span class="screen-reader-text">Add</span>
                                        <i class="fa fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="project__main">
                            <label for="project-name">Name: <span class="required">*</span></label>
                            <input ng-model="selectedProject.name" type="text" name="project-name" id="project-name" class="input project__name" placeholder="Portfolio" tabindex="1" oninput="jpi.helpers.checkInput(this);" required />

                            <label for="project-type">Type: <span class="required">*</span></label>
                            <input ng-model="selectedProject.type" type="text" name="project-type" id="project-type" class="input project__type" placeholder="Web App" tabindex="1" oninput="jpi.helpers.checkInput(this);" required />

                            <label for="project-url">URL:</label>
                            <input ng-model="selectedProject.url" type="text" name="project-url" id="project-url" class="input project__url" placeholder="https://jahidulpabelislam.com/" tabindex="1" />

                            <label for="project-github-url">GitHub:</label>
                            <input ng-model="selectedProject.github_url" type="url" name="project-github-url" id="project-github-url" class="input project__github" placeholder="http://github.com/jahidulpabelislam/portfolio/" tabindex="1" />

                            <label for="project-download-url">Download:</label>
                            <input ng-model="selectedProject.download_url" type="text" name="project-download-url" id="project-download-url" class="input project__download" placeholder="https://github.com/jahidulpabelislam/portfolio/archive/v4.zip" tabindex="1" />

                            <label for="project-short-desc">Short Description: <span class="required">*</span></label>
                            <textarea ng-if="selectedProject" ui-tinymce="tinymceOptions" ng-model="selectedProject.short_description" name="project-short-desc" id="project-short-desc" class="project__short-desc" tabindex="1"></textarea>

                            <label for="project-long-desc">Long Description: <span class="required">*</span></label>
                            <textarea ng-if="selectedProject" ui-tinymce="tinymceOptions" ng-model="selectedProject.long_description" name="project-long-desc" id="project-long-desc" class="project__long-desc" tabindex="1"></textarea>

                            <button type="submit" class="btn btn--dark-green project__save-button" tabindex="1">
                                <span class="screen-reader-text">{{ selectedProject.id ? "Update Project" : "Add Project" }}</span>
                                <i class="fa fa-upload"></i>
                            </button>
                        </div>

                        <div class="project__sidebar clearfix" ng-if="selectedProject.id">
                            <div class="project__sidebar-block" ng-if="selectedProject.images.length">
                                <!-- Div containing all the project images -->
                                <ul ui-sortable ng-model="selectedProject.images" class="project__images-container ui-state-default">
                                    <li class="project__image-container" ng-repeat="image in selectedProject.images" id="{{ image.id }}">
                                        <img class="project__image" src="{{ image.url }}" />
                                        <button type="button" ng-click="deleteProjectImage(image)" class="btn btn--red project__image-delete-button" tabindex="1">X</button>
                                    </li>
                                </ul>
                            </div>

                            <div class="project__sidebar-block project__image-drop-zone">
                                <p class="project__image-drop-zone-text">
                                    <label class="project__faux-image-upload" for="project-image-upload">Choose</label> or Drop Image(s) Here To Upload for Project
                                </p>

                                <input data-file-Upload type="file" id="project-image-upload" class="input project__image-upload" multiple accept="image/*" tabindex="1" />
                            </div>

                            <div class="project__sidebar-block" ng-if="uploads.length">
                                <!-- Div containing the project image uploads -->
                                <div class="project__uploads">
                                    <div ng-repeat="upload in uploads" class="project__upload" ng-class="upload.ok == true ? 'project__upload--success' : 'project__upload--failed'">
                                        <p>{{ upload.text }}</p>
                                        <img ng-if="upload.ok == true" src="{{ upload.image }}" />
                                        <button type="button" ng-if="upload.ok == true" ng-click="sendImage(upload)" class="btn btn--dark-blue" tabindex="1">
                                            <span class="screen-reader-text">Upload This Image</span>
                                            <i class="fa fa-upload"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
