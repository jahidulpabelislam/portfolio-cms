<div class="projects-select">
    <p class="feedback feedback--error projects-select__feedback"></p>

    <table class="projects-select__table table table--sticky">
        <thead>
            <tr class="table__row">
                <th class="table__header">ID</th>
                <th class="table__header">Name</th>
                <th class="table__header">Date</th>
                <th class="table__header">Created At</th>
                <th class="table__header">Last Modified</th>
                <th class="table__header table__header--center">-</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <ul class="pagination"></ul>
</div>

<script type="text/template" id="js-projects-table-row">
    <tr class="table__row">
        <td class="table__column" data-title="ID">{{ id }}</td>
        <td class="table__column" data-title="Name">{{ name }}</td>
        <td class="table__column" data-title="Date">{{ date }}</td>
        <td class="table__column" data-title="Created At">{{ created_at }}</td>
        <td class="table__column" data-title="Last Modified">{{ updated_at }}</td>
        <td class="table__column table__column--center table__column--no-padding">
            <a class="projects-select__edit-button" href="/project/edit/{{ id }}/" data-id="{{ id }}" title="Link to Edit Project Form Page" tabindex="1">
                <span class="visually-hidden">Edit</span>
                <i class="fas fa-edit"></i>
            </a>

            <button type="button" class="projects-select__delete-button" data-id="{{ id }}" tabindex="1">
                <span class="visually-hidden">Delete</span>
                <i class="fas fa-trash"></i>
            </button>
        </td>
    </tr>
</script>
