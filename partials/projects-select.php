<?php
if (!defined("ROOT")) {
    die();
}
?>

                <div class="projects-select" ng-show="isLoggedIn">

                    <p class="feedback feedback--error projects-select__feedback" ng-show="selectProjectFeedback">
                        {{ selectProjectFeedback }}
                    </p>

                    <div>
                        <a class="btn btn--dark-green projects-select__add-button js-new-project" href="/project/new/" title="Link to New Project Form Page" tabindex="1">
                            <span class="screen-reader-text">Add A New Project</span>
                            <i class="fas fa-plus"></i>
                        </a>
                    </div>

                    <table class="projects-select__table table table--sticky">
                        <thead>
                            <tr class="table__row">
                                <th class="table__header">ID</th>
                                <th class="table__header">Name</th>
                                <th class="table__header">Date</th>
                                <th class="table__header">Last Modified</th>
                                <th class="table__header">Created at</th>
                                <th class="table__header">-</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table__row" ng-repeat="project in projects">
                                <td class="table__column" data-title="ID">{{ project.id }}</td>
                                <td class="table__column" data-title="Name">{{ project.name }}</td>
                                <td class="table__column" data-title="Date">{{ project.date | date: 'EEEE d MMMM yyyy' }}</td>
                                <td class="table__column" data-title="Last Modified">{{ project.updated_at | date: 'EEEE d MMMM yyyy' }}</td>
                                <td class="table__column" data-title="Created at">{{ project.created_at | date: 'EEEE d MMMM yyyy' }}</td>
                                <td class="table__column table__column--no-padding">
                                    <a class="btn btn--dark-blue projects-select__edit-button js-edit-project" href="/project/{{ project.id }}/edit/" title="Link to Edit Project Form Page" tabindex="1" ng-click="selectProject(project)">
                                        <span class="screen-reader-text">Edit</span>
                                        <i class="fas fa-edit"></i>
                                    </a>

                                    <button type="button" class="btn btn--red projects-select__delete-button" ng-click="selectProject(project); checkAuthStatus(deleteProject);" tabindex="1">
                                        <span class="screen-reader-text">Delete</span>
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <ul class="pagination" ng-show="pages.length > 1">
                        <li class="pagination__item" ng-repeat="page in pages" >
                            <a class="pagination__item-link js-projects" href="/projects/{{ page }}/" title="Link to Projects Page" ng-class="{'active': page == currentPage}" data-page="{{ page }}" tabindex="1">{{ page }}</a>
                        </li>
                    </ul>
                </div>
