const gulp = require("gulp");

const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const cleanCss = require("gulp-clean-css");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass");

let defaultTasks = [];

// Concatenate & Minify JS
const scripts = {
    main: [
        "./assets/js/third-party/jquery.min.js",
        "./assets/js/third-party/jquery-ui.min.js",
        "./assets/js/third-party/angular.min.js",
        "./assets/js/third-party/angular-ui-tinymce.min.js",
        "./assets/js/third-party/sortable.js",
        "./assets/js/jpi/helpers.js",
        "./assets/js/jpi/drag-n-drop.js",
        "./assets/js/jpi/nav.js",
    ],
};
const scriptNames = Object.keys(scripts);

let scriptTasks = [];
scriptNames.forEach(function(key) {
    const scriptTask = "scripts-" + key;
    scriptTasks.push(scriptTask);
    gulp.task(scriptTask, function() {
        return gulp.src(scripts[key])
                   .pipe(concat(key + ".min.js"))
                   .pipe(uglify())
                   .pipe(gulp.dest("./assets/js/"));
    });
});
gulp.task("scripts", gulp.parallel(scriptTasks));
defaultTasks.push("scripts");

// Minify Stylesheets
const stylesheets = {
    main: [
        "./assets/css/main.css",
    ],
};
const stylesheetNames = Object.keys(stylesheets);

let stylesheetTasks = [];
stylesheetNames.forEach(function(key) {
    const stylesheetTask = "styles-" + key;
    stylesheetTasks.push(stylesheetTask);
    gulp.task(stylesheetTask, function() {
        return gulp.src(stylesheets[key])
                   .pipe(concat(key + ".min.css"))
                   .pipe(
                       autoprefixer({
                           browsers: ["> 0.1%", "ie 8-11"],
                           remove: false,
                       })
                   )
                   .pipe(
                       cleanCss({
                           compatibility: "ie8",
                       })
                   )
                   .pipe(gulp.dest("./assets/css/"));
    });
});
gulp.task("styles", gulp.parallel(stylesheetTasks));
defaultTasks.push("styles");

gulp.task("sass", function() {
    return gulp.src("./assets/css/main.scss")
               .pipe(sass().on("error", sass.logError))
               .pipe(gulp.dest("./assets/css/"));
});
// Watch Files For Changes
gulp.task("watch", function() {
    gulp.watch("./assets/css/**/*.scss", gulp.parallel("sass"));
});

gulp.task("default", gulp.parallel(defaultTasks));
