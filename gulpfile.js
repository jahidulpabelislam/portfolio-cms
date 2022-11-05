const gulp = require("gulp");

const concat = require("gulp-concat");

const uglify = require("gulp-uglify");

const cleanCss = require("gulp-clean-css");
const autoPrefix = require("gulp-autoprefixer");

const sass = require("gulp-sass")(require("node-sass"));

const assetsDir = "./assets";
const cssDir = `${assetsDir}/css`;
const jsDir = `${assetsDir}/js`;

const defaultTasks = [];

// Concatenate & Minify JS
defaultTasks.push("scripts");
gulp.task("scripts", function(callback) {
    const scripts = {
        main: [
            `${jsDir}/third-party/tinymce/tinymce.min.js`,
            `${jsDir}/third-party/Sortable.min.js`,
            `${jsDir}/jpi/helpers.js`,
            `${jsDir}/jpi/drag-n-drop.js`,
            `${jsDir}/jpi/nav.js`,
            `${jsDir}/jpi/router.js`,
            `${jsDir}/jpi/app.js`,
        ],
    };
    const scriptNames = Object.keys(scripts);

    scriptNames.forEach(function(key) {
        gulp.src(scripts[key])
            .pipe(concat(`${key}.min.js`))
            .pipe(uglify())
            .pipe(gulp.dest(`${jsDir}/`));
    });

    callback();
});

defaultTasks.push("sass");
gulp.task("sass", function() {
    return gulp.src(`${cssDir}/jpi/main.scss`)
               .pipe(sass().on("error", sass.logError))
               .pipe(gulp.dest(`${cssDir}/jpi/`));
});

// Watch SASS files For changes to compile to css
gulp.task("watch", function() {
    gulp.watch(`${cssDir}/**/*.scss`, gulp.parallel("sass"));
});

// Minify Stylesheets
defaultTasks.push("styles");
gulp.task("styles", function(callback) {
    const stylesheets = {
        main: [
            `${cssDir}/jpi/main.css`,
        ],
    };
    const stylesheetNames = Object.keys(stylesheets);

    stylesheetNames.forEach(function(key) {
        gulp.src(stylesheets[key])
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

    callback();
});

gulp.task("default", gulp.series(defaultTasks));
