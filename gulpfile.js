const gulp = require("gulp");

const sass = require("gulp-sass")(require("sass-embedded"));

const sourcemaps = require("gulp-sourcemaps");

const assetsDir = "./assets";
const cssDir = `${assetsDir}/css`;

gulp.task("sass", function() {
    return gulp.src(`${cssDir}/jpi/main.scss`)
               .pipe(sourcemaps.init())
               .pipe(sass().on("error", sass.logError))
               .pipe(sourcemaps.write("maps/"))
               .pipe(gulp.dest(`${cssDir}/jpi/`));
});

// Watch SASS files For changes to compile to css
gulp.task("watch", function() {
    gulp.watch(`${cssDir}/**/*.scss`, gulp.parallel("sass"));
});

gulp.task("default", gulp.series(["sass"]));
