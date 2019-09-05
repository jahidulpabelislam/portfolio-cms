const gulp = require("gulp"),

    concat = require("gulp-concat"),

    uglify = require("gulp-uglify"),

    cleanCss = require("gulp-clean-css"),
    autoPrefix = require("gulp-autoprefixer"),

    sass = require("gulp-sass");

const assetsDir = "./assets";
const cssDir = `${assetsDir}/css`;
const jsDir = `${assetsDir}/js`;

let defaultTasks = [];

// Concatenate & Minify JS
const scripts = {
    main: [
        `${jsDir}/third-party/jquery.min.js`,
        `${jsDir}/third-party/jquery-ui.min.js`,
        `${jsDir}/third-party/angular.min.js`,
        `${jsDir}/third-party/tinymce/tinymce.min.js`,
        `${jsDir}/third-party/angular-ui-tinymce.min.js`,
        `${jsDir}/third-party/sortable.js`,
        `${jsDir}/third-party/sticky-footer.min.js`,
        `${jsDir}/jpi/helpers.js`,
        `${jsDir}/jpi/drag-n-drop.js`,
        `${jsDir}/jpi/nav.js`,
    ],
};
const scriptNames = Object.keys(scripts);

let scriptTasks = [];
scriptNames.forEach(function(key) {
    const scriptTask = `scripts-${key}`;
    scriptTasks.push(scriptTask);
    gulp.task(scriptTask, function() {
        return gulp.src(scripts[key])
                   .pipe(concat(`${key}.min.js`))
                   .pipe(uglify())
                   .pipe(gulp.dest(`${jsDir}/`));
    });
});
gulp.task("scripts", gulp.parallel(scriptTasks));
defaultTasks.push("scripts");

// Minify Stylesheets
const stylesheets = {
    main: [
        `${cssDir}/jpi/main.css`,
    ],
};
const stylesheetNames = Object.keys(stylesheets);

let stylesheetTasks = [];
stylesheetNames.forEach(function(key) {
    const stylesheetTask = `styles-${key}`;
    stylesheetTasks.push(stylesheetTask);
    gulp.task(stylesheetTask, function() {
        return gulp.src(stylesheets[key])
                   .pipe(concat(`${key}.min.css`))
                   .pipe(autoPrefix({
                       browsers: ["> 0.1%", "ie 8-11"],
                       remove: false,
                   }))
                   .pipe(cleanCss({
                       compatibility: "ie8",
                   }))
                   .pipe(gulp.dest(`${cssDir}/jpi/`));
    });
});
gulp.task("styles", gulp.parallel(stylesheetTasks));
defaultTasks.push("styles");

gulp.task("sass", function() {
    return gulp.src(`${cssDir}/jpi/main.scss`)
               .pipe(sass().on("error", sass.logError))
               .pipe(gulp.dest(`${cssDir}/jpi/`));
});
// Watch Files For Changes
gulp.task("watch", function() {
    gulp.watch(`${cssDir}/**/*.scss`, gulp.parallel("sass"));
});

gulp.task("default", gulp.parallel(defaultTasks));
