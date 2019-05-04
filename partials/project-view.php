<?php
if (!defined("ROOT")) {
    die();
}
?>

                <div class="project-view" ng-show="isLoggedIn">
                    <p class="feedback project__feedback hide"><span>{{ projectFormFeedback }}</span>
                        <button class="project__hide-error" ng-click="hideProjectError()">X</button>
                    </p>

                    <a href="/projects/" title="Link to Projects Page" class="btn btn--orange project__back-button js-projects" tabindex="6">
                        <span class="screen-reader-text">Back</span>
                        <i class="fa fa-arrow-circle-left"></i>
                    </a>

                    <div ng-if="selectedProject && selectedProject.id">
                        <p>Created at: {{ selectedProject.created_at | date: 'EEEE d MMMM y h:mma' }}</p>
                        <p>Updated at: {{ selectedProject.updated_at | date:'EEEE d MMMM y h:mma' }}</p>
                    </div>

                    <form id="projectForm" class="project__form" ng-submit="checkAuthStatus(submitProject)" ng-if="selectedProject">
                        <label for="project-name">Project Name: <span class="required">*</span></label>
                        <input ng-model="selectedProject.name" type="text" name="project-name" id="project-name" class="input project__name" placeholder="myproject" tabindex="7" oninput="jpi.helpers.checkInputField(this);" required />

                        <label for="project-status">Status: <span class="required">*</span></label>
                        <select ng-model="selectedProject.status" name="project-status" id="project-status" class="input project__status" tabindex="1" required>
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
                        <input ng-model="selectedProject.date" type="date" name="project-date" id="project-date" class="input project__date" placeholder="2016-01-30" tabindex="13" oninput="jpi.helpers.checkInputField(this);" required />

                        <label for="project-link">Link:</label>
                        <input ng-model="selectedProject.link" type="text" name="project-link" id="project-link" class="input project__link" placeholder="link" tabindex="10" />

                        <label for="project-github">GitHub:</label>
                        <input ng-model="selectedProject.github" type="url" name="project-github" id="project-github" class="input project__github" placeholder="github" tabindex="11" />

                        <label for="project-download">Download:</label>
                        <input ng-model="selectedProject.download" type="text" name="project-download" id="project-download" class="input project__download" placeholder="download" tabindex="12" />

                        <label for="project-colour">Colour:</label>
                        <select ng-options="colour as colourName for (colour, colourName) in colourOptions" ng-model="selectedProject.colour" name="project-colour" id="project-colour" class="input project__colour" tabindex="14">
                        </select>

                        <label for="skill-input">Skills: <span class="required">*</span></label>

                        <div ng-model="selectedProject.skills" ui-sortable class="ui-state-default">
                            <p ng-repeat="skill in selectedProject.skills" class="project__skill project__skill--{{ selectedProject.colour }}">{{ skill }}
                                <button class="btn project__skill-delete-button" ng-click="deleteSkill(skill)" type="button">x</button>
                            </p>
                        </div>

                        <div class="project__skill-input-container">
                            <label for="skill-input" class="screen-reader-text">Add skills for project.</label>
                            <input type="text" class="input project__skill-input" id="skill-input" placeholder="HTML5" ng-model="skillInput" />
                            <button class="btn btn--green project__skill-add-button" type="button" id="skill-add" ng-click="addSkill()" type="button">
                                <span class="screen-reader-text">Add</span>
                                <i class="fa fa-plus"></i>
                            </button>
                        </div>

                        <label for="project-short-desc">Short Description: <span class="required">*</span></label>
                        <textarea ui-tinymce="tinymceOptions" ng-model="selectedProject.short_description" name="project-short-desc" id="project-short-desc" class="project__short-desc" tabindex="9"></textarea>

                        <label for="project-long-desc">Long Description: <span class="required">*</span></label>
                        <textarea ui-tinymce="tinymceOptions" ng-model="selectedProject.long_description" name="project-long-desc" id="project-long-desc" class="project__long-desc" tabindex="9"></textarea>

                        <!-- Div containing all the project images -->
                        <ul ui-sortable ng-model="selectedProject.images" class="project__images-container ui-state-default">
                            <li class="project__image-container" ng-repeat="image in selectedProject.images" id="{{ image.file }}">
                                <img class="project__image" src="<?php echo rtrim(JPI_API_ENDPOINT, "/"); ?>{{ image.file }}" />
                                <button ng-click="deleteProjectImage(image)" class="btn btn--red project__image-delete-button" type="button">X</button>
                            </li>
                        </ul>

                        <button type="submit" value="Add Project" class="btn btn--green project__save-button" tabindex="14">
                            <span class="screen-reader-text">{{ selectedProject.id ? "Update Project" : "Add Project" }}</span>
                            <i class="fa fa-upload"></i>
                        </button>

                        <input ng-if="selectedProject.id" data-file-Upload type="file" name="imageUpload" id="imageUpload" class="input" multiple accept="image/*" tabindex="15" />

                        <!-- Div containing the project image uploads -->
                        <div class="project__uploads">
                            <div ng-repeat="upload in uploads" class="project__upload" ng-class="upload.ok == true ? 'project__upload--success' : 'project__upload--failed'">
                                <p>{{ upload.text }}</p>
                                <img ng-if="upload.ok == true" src="{{ upload.image }}" />
                                <button ng-if="upload.ok == true" ng-click="sendImage(upload)" class="btn btn--blue" type="button">
                                    <span class="screen-reader-text">Upload This Image</span>
                                    <i class="fa fa-upload"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
