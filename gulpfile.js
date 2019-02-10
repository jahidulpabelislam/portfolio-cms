var gulp = require("gulp");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cleanCss = require("gulp-clean-css");
var autoprefixer = require("gulp-autoprefixer");
var sass = require("gulp-sass");

// Concatenate & Minify JS
var scripts = {
    main: [
        "assets/js/third-party/jquery.min.js",
        "assets/js/third-party/jquery-ui.min.js",
        "assets/js/third-party/angular.min.js",
        "assets/js/third-party/sortable.js",
        "assets/js/jpi/helpers.js",
        "assets/js/jpi/dragNDrop.js",
        "assets/js/jpi/nav.js",
    ],
};
var scriptNames = Object.keys(scripts);
var scriptTasks = [];
scriptNames.forEach(function(key) {
    var scriptTask = "scripts-" + key;
    scriptTasks.push(scriptTask);
    gulp.task(scriptTask, function() {
        return gulp.src(scripts[key])
                   .pipe(concat(key + ".min.js"))
                   .pipe(uglify())
                   .pipe(gulp.dest("assets/js"));
    });
});
gulp.task("scripts", scriptTasks);

// Minify Stylesheets
var stylesheets = {
    main: [
        "assets/css/main.css",
    ],
};
var stylesheetNames = Object.keys(stylesheets);
var stylesheetTasks = [];
stylesheetNames.forEach(function(key) {
    var stylesheetTask = "styles-" + key;
    stylesheetTasks.push(stylesheetTask);
    gulp.task(stylesheetTask, function() {
        return gulp.src(stylesheets[key])
                   .pipe(concat(key + ".min.css"))
                   .pipe(
                       autoprefixer({
                           browsers: ["> 0.5%", "ie 8-11"],
                           remove: false,
                       })
                   )
                   .pipe(
                       cleanCss({
                           compatibility: "ie8",
                       })
                   )
                   .pipe(gulp.dest("assets/css"));
    });
});
gulp.task("styles", stylesheetTasks);

gulp.task("sass", function() {
    return gulp.src("assets/css/main.scss")
               .pipe(sass().on("error", sass.logError))
               .pipe(gulp.dest("assets/css/"));
});
// Watch Files For Changes
gulp.task("watch", function() {
    gulp.watch("assets/css/**/*.scss", ["sass"]);
});

gulp.task("default", ["scripts", "styles"]);