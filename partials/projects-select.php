<?php
if (!defined("ROOT")) {
    die();
}
?>

                <div class="projects-select" ng-show="isLoggedIn">

                    <div class="projects-select__form">
                        <div ng-repeat="project in projects" class="projects-select__option styled-checkbox">
                            <label for="project-{{ project.id }}" class="styled-checkbox__label">
                                <input type="radio" id="project-{{ project.id }}" name="project" value="{{ project.id }}" class="input checkbox" ng-model="selectedProject" ng-change="selectProject(project)" tabindex="1" />
                                {{ project.name }}<span class="styled-checkbox__pseudo js-styled-checkout"></span>
                            </label>
                        </div>
                    </div>

                    <p class="feedback feedback--error projects-select__feedback" ng-show="selectProjectFeedback">{{ selectProjectFeedback }}</p>

                    <div>
                        <a href="/project/{{ selectedProject.id }}/edit/" title="Link to Edit Project Form Page" ng-show="projects.length > 0" ng-disabled="!selectedProject.id" class="btn btn--dark-blue projects-select__edit-button js-edit-project" tabindex="1">
                            <span class="screen-reader-text">Edit</span>
                            <i class="fa fa-edit"></i>
                        </a>
                        <button type="button" ng-show="projects.length > 0" ng-click="checkAuthStatus(deleteProject)" value="Delete" class="btn btn--red projects-select__delete-button" tabindex="1">
                            <span class="screen-reader-text">Delete</span>
                            <i class="fa fa-trash"></i>
                        </button>
                        <a href="/project/new/" title="Link to New Project Form Page" class="btn btn--dark-green projects-select__add-button js-new-project" tabindex="1">
                            <span class="screen-reader-text">Add A Project</span>
                            <i class="fa fa-plus"></i>
                        </a>
                    </div>

                    <ul class="pagination" ng-show="pages.length > 1">
                        <li ng-repeat="page in pages" class="pagination__item">
                            <a href="/projects/{{ page }}/" title="Link to Projects Page" class="pagination__item-link js-projects" ng-class="{'active': page == currentPage}" data-page="{{ page }}" tabindex="1">{{ page }}</a>
                        </li>
                    </ul>
                </div>
