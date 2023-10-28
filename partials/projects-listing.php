<?php
$ch = curl_init();
curl_setopt(
    $ch,
    CURLOPT_URL,
    \JPI\Utils\URL::removeTrailingSlash(JPI_API_ENDPOINT) . "/v" . JPI_API_VERSION . "/project-types/"
);
curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    [
        "Accept: application/json",
    ]
);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 4); // Seconds

$apiRes = json_decode(curl_exec($ch), true);
curl_close($ch);

$projectTypes = $apiRes["data"];
?>
<div class="projects-listing">
    <p class="feedback feedback--error projects-listing__feedback"></p>

    <form class="projects-listing__filters">
        <div class="projects-listing-filter projects-listing-filter--search projects-listing-filter-search">
            <input class="input js-filters-search" type="text" value="" placeholder="Search ..." />
        </div>
        <div class="projects-listing-filter">
            <select class="input js-filters-type js-filters-on-change">
                <option value="">Type</option>
                <?php foreach ($projectTypes as $projectType): ?>
                    <option value="<?= $projectType["id"] ?>"><?= $projectType["name"] ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="projects-listing-filter">
            <input class="input js-filters-date js-filters-on-change" type="date" value="" />
        </div>
        <div class="projects-listing-filter">
            <div class="projects-listing__option styled-checkbox">
                <label for="projects-listing-filter-published" class="">
                    <input type="checkbox" class="input checkbox js-filters-published js-filters-on-change" id="projects-listing-filter-published" value="true" />
                    <span class="styled-checkbox__pseudo"></span>
                    <span class="styled-checkbox__label">Published Only?</span>
                </label>
            </div>
        </div>
    </form>

    <table class="projects-listing__table table table--sticky">
        <thead>
            <tr class="table__row">
                <th class="table__header">Name</th>
                <th class="table__header">Type</th>
                <th class="table__header">Date</th>
                <th class="table__header">Updated At</th>
                <th class="table__header">Is Published?</th>
                <th class="table__header"></th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <ul class="projects-listing__pagination pagination"></ul>
</div>

<script type="text/template" id="js-projects-table-row">
    <tr class="table__row">
        <td class="table__column" data-title="Name">{{ name }}</td>
        <td class="table__column" data-title="Type">{{ type }}</td>
        <td class="table__column" data-title="Date">{{ date }}</td>
        <td class="table__column" data-title="Last Modified">{{ updated_at }}</td>
        <td class="table__column" data-title="Is Published?">{{ status }}</td>
        <td class="table__column table__column--right">
            <a class="projects-listing__edit-button" href="/project/edit/{{ id }}/" data-id="{{ id }}" title="Link to Edit Project Form Page" tabindex="1">
                <span class="visually-hidden">Edit</span>
                <span class="material-symbols-outlined">edit_square</span>
            </a>

            <button type="button" class="projects-listing__delete-button" data-id="{{ id }}" tabindex="1">
                <span class="visually-hidden">Delete</span>
                <span class="material-symbols-outlined">delete</span>
            </button>
        </td>
    </tr>
</script>
