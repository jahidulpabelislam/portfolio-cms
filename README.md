# Portfolio CMS

This CMS is to manage the projects and it's images displayed in my [Portfolio](https://jahidulpabelislam.com/). This is all connected together via a [API](https://github.com/jahidulpabelislam/portfolio-api/) as well as the actual [Portfolio](https://github.com/jahidulpabelislam/portfolio/).

The CMS (and API) was created as I realised that all the projects within my site were consistent in terms of what information was being shown. Therefore, for future proofing and making it easier to maintain, I thought to make sure it is ALWAYS consistent I can define a common project structure, so each project has the same information. This was done by adding CRUD abilities through a database via a CMS and API.

By doing this, in the website, I can define one project element/HTML structure and styling and then just do a loop through all the projects returned from the API via an AJAX request and create multiple project elements using that one defined structure.

This way I can easily update a project structure for all current projects at once (e.g adding a new piece of information). However, this does also mean it creates more work as I will now need to update the Database structure, API endpoints & CMS and Website (HTML, CSS & Javascript), instead of just updating the hardcoded HTML of projects.

The CMS was originally built within the Portfolio project/repo, and the first three versions were built within this project. However, starting from version 4, I decided it would be a good idea to create the separation of concerns by separating the API (and CMS) from the portfolio to aid maintainability and readability.

## [v1](https://github.com/jahidulpabelislam/portfolio/tree/v2/)

The first initial creation was done in 2016.

I had used the usual vanilla JavaScript, HTML5 & CSS3.

## [v2](https://github.com/jahidulpabelislam/portfolio/tree/v3/)

In 2017, while browsing the web I had come across [AngularJS](https://angularjs.org/), and then really wanted to experiment with this. I thought my CMS was a good use case for AngularJS, therefore for version 2, I decided to rebuild my CMS using AngularJS.

Around the same time, I had integrated jQuery, SCSS and [Bootstrap3](https://getbootstrap.com/docs/3.3/) into the main portfolio so integrated these into the CMS as well.

## [v3](https://github.com/jahidulpabelislam/portfolio/tree/v4/)

Towards the end of 2017 and the start of 2018 I had been in a full-time job for 6 - 12 months, I had got to a point where I gained a lot of knowledge in web developing since the beginning of the project.
Therefore I thought my portfolio could be improved with a big overhaul with this new experience.

Some of the tasks for the CMS was to add (better) rooting, removing Bootstrap3, using [BEM](http://getbem.com/introduction/) for HTML element class naming and removing the use of element id's and finally as always a tidy up of code as I started seeing code differently since getting the developer job.

## [v4](https://github.com/jahidulpabelislam/portfolio-cms/tree/v4/)

At the end of 2018, I aimed to split the CMS part of the Portfolio project and create a new base project to build from in the future for new features and new versions. This was then the start of v4.

A sub-aim while migrating the app was to also refactor the whole of the project with better code and following consistent standards throughout (HTML, JavaScript, SCSS & PHP).

I also integrated JWT auth for the Cross-domain requests to the API for secured endpoints such as Insert, Update & Delete requests.
