<?php
if (!defined("ROOT")) {
    die();
}
?>

                <div class="project-view" ng-show="isLoggedIn">
                    <p class="feedback project__feedback hide">
                        <span>{{ projectFormFeedback }}</span>
                        <button type="button" class="project__hide-error" ng-click="hideProjectFeedback()">X</button>
                    </p>

                    <a class="btn btn--orange project__back-button js-projects" href="/projects/" title="Link to Projects Page" tabindex="1">
                        <span class="screen-reader-text">Back</span>
                        <i class="fas fa-arrow-circle-left"></i>
                    </a>

                    <div ng-if="selectedProject && selectedProject.id">
                        <p>Created at: {{ selectedProject.created_at | date: 'EEEE d MMMM y h:mma' }}</p>
                        <p>Updated at: {{ selectedProject.updated_at | date:'EEEE d MMMM y h:mma' }}</p>
                    </div>

                    <form class="project__form" id="projectForm" ng-submit="checkAuthStatus(submitProject)">
                        <label for="project-name">Name: <span class="required">*</span></label>
                        <input type="text" class="input project__name" id="project-name" name="project-name" ng-model="selectedProject.name" placeholder="myproject" tabindex="1" oninput="jpi.helpers.checkInput(this);" required />

                        <label for="project-status">Status: <span class="required">*</span></label>
                        <select class="input project__status" id="project-status" name="project-status" ng-model="selectedProject.status" tabindex="1" required>
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

                        <label for="project-date">Date: <span class="required">*</span></label>
                        <input type="date" class="input project__date" id="project-date" name="project-date" ng-model="selectedProject.date" placeholder="2016-01-30" tabindex="1" oninput="jpi.helpers.checkInput(this);" required />

                        <label for="project-type">Type: <span class="required">*</span></label>
                        <input type="text" class="input project__type" id="project-type" name="project-type" ng-model="selectedProject.type" placeholder="Web App" tabindex="1" oninput="jpi.helpers.checkInput(this);" required />

                        <label for="project-url">URL:</label>
                        <input type="text" class="input project__url" id="project-url" name="project-url" ng-model="selectedProject.url" placeholder="https://jahidulpabelislam.com/" tabindex="1" />

                        <label for="project-github-url">GitHub:</label>
                        <input type="url" class="input project__github" id="project-github-url" name="project-github-url" ng-model="selectedProject.github_url" placeholder="http://github.com/jahidulpabelislam/portfolio/" tabindex="1" />

                        <label for="project-download-url">Download:</label>
                        <input type="text" class="input project__download" id="project-download-url" name="project-download-url" ng-model="selectedProject.download_url" placeholder="download" tabindex="1" />

                        <label for="project-colour">Colour:</label>
                        <select class="input project__colour" id="project-colour" name="project-colour" ng-model="selectedProject.colour" ng-options="colour as colourName for (colour, colourName) in colourOptions" tabindex="1">
                        </select>

                        <label for="skill-input">Skills: <span class="required">*</span></label>

                        <div ng-model="selectedProject.skills" ui-sortable class="ui-state-default">
                            <p class="project__skill project__skill--{{ selectedProject.colour }}" ng-repeat="skill in selectedProject.skills track by $index">
                                {{ skill }}
                                <button type="button" class="btn project__skill-delete-button" ng-click="deleteSkill(skill)" tabindex="1">
                                    x
                                </button>
                            </p>
                        </div>

                        <div class="project__skill-input-container">
                            <label for="skill-input" class="screen-reader-text">Add skills for project.</label>
                            <input type="text" class="input project__skill-input" id="skill-input" ng-model="skillInput" placeholder="HTML5" tabindex="1" />
                            <button type="button" class="btn btn--dark-green project__skill-add-button" id="skill-add" ng-click="addSkill()" tabindex="1">
                                <span class="screen-reader-text">Add</span>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>

                        <label for="project-short-desc">Short Description: <span class="required">*</span></label>
                        <textarea class="project__short-desc" id="project-short-desc" name="project-short-desc" ng-if="selectedProject" ui-tinymce="tinymceOptions" ng-model="selectedProject.short_description" tabindex="1"></textarea>

                        <label for="project-long-desc">Long Description: <span class="required">*</span></label>
                        <textarea class="project__long-desc" id="project-long-desc" name="project-long-desc" ng-if="selectedProject" ui-tinymce="tinymceOptions" ng-model="selectedProject.long_description" tabindex="1"></textarea>

                        <!-- Div containing all the project images -->
                        <ul ui-sortable ng-model="selectedProject.images" class="project__images-container ui-state-default">
                            <li class="project__image-container" id="{{ image.id }}" ng-repeat="image in selectedProject.images">
                                <img class="project__image" src="{{ image.url }}" alt="Image of {{ selectedProject.name }}"/>
                                <button type="button" class="btn btn--red project__image-delete-button" ng-click="deleteProjectImage(image)" tabindex="1">X</button>
                            </li>
                        </ul>

                        <button type="submit" class="btn btn--dark-green project__save-button" tabindex="1">
                            <span class="screen-reader-text">{{ selectedProject.id ? "Update Project" : "Add Project" }}</span>
                            <i class="fas fa-upload"></i>
                        </button>

                        <input type="file" class="input" id="imageUpload" name="imageUpload" ng-if="selectedProject.id" data-file-Upload accept="image/*" multiple tabindex="1" />

                        <!-- Div containing the project image uploads -->
                        <div class="project__uploads">
                            <div class="project__upload" ng-repeat="upload in uploads" ng-class="upload.ok == true ? 'project__upload--success' : 'project__upload--failed'">
                                <p>{{ upload.text }}</p>
                                <img src="{{ upload.image }}" alt="Screenshot of {{ selectedProject.name }}" ng-if="upload.ok == true"  />
                                <button type="button" ng-if="upload.ok == true" ng-click="sendImage(upload)" class="btn btn--dark-blue" tabindex="1">
                                    <span class="screen-reader-text">Upload This Image</span>
                                    <i class="fas fa-upload"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
