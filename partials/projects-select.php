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

                    <p class="feedback feedback--error projects-select__feedback" ng-show="selectProjectFeedback">
                        {{ selectProjectFeedback }}
                    </p>

                    <div>
                        <a class="btn btn--dark-blue projects-select__edit-button js-edit-project" href="/project/{{ selectedProject.id }}/edit/" title="Link to Edit Project Form Page" ng-show="projects.length > 0" ng-disabled="!selectedProject.id" tabindex="1">
                            <span class="screen-reader-text">Edit</span>
                            <i class="fas fa-edit"></i>
                        </a>
                        <button type="button" class="btn btn--red projects-select__delete-button" ng-show="projects.length > 0" ng-click="checkAuthStatus(deleteProject)" tabindex="1">
                            <span class="screen-reader-text">Delete</span>
                            <i class="fas fa-trash"></i>
                        </button>
                        <a class="btn btn--dark-green projects-select__add-button js-new-project" href="/project/new/" title="Link to New Project Form Page" tabindex="1">
                            <span class="screen-reader-text">Add A Project</span>
                            <i class="fas fa-plus"></i>
                        </a>
                    </div>

                    <ul class="pagination" ng-show="pages.length > 1">
                        <li class="pagination__item"ng-repeat="page in pages" >
                            <a class="pagination__item-link js-projects" href="/projects/{{ page }}/" title="Link to Projects Page" ng-class="{'active': page == currentPage}" data-page="{{ page }}" tabindex="1">{{ page }}</a>
                        </li>
                    </ul>
                </div>
