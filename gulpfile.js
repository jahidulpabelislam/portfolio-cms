var gulp = require("gulp");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cleanCss = require("gulp-clean-css");
var autoprefixer = require("gulp-autoprefixer");
var sass = require("gulp-sass");

// Concatenate & Minify JS
var scripts = {
	admin: [
		"assets/js/jpi/helpers.js",
		"assets/js/jpi/stickyFooter.js",
		"assets/js/jpi/dragNDrop.js",
		"assets/js/jpi/nav.js",
		"assets/js/third-party/jquery-ui.min.js",
		"assets/js/third-party/sortable.js",
	]
};
var scriptNames = Object.keys(scripts);
scriptNames.forEach(function (key, i) {
	gulp.task("scripts-" + key, function () {
		return gulp.src(scripts[key])
	            .pipe(concat(key + ".min.js"))
				.pipe(uglify())
				.pipe(gulp.dest("assets/js"));
	});
});
gulp.task("scripts", ["scripts-admin",]);

// Minify Stylesheets
var stylesheets = {
	main: [
		"assets/css/style.css",
	]
};
var stylesheetNames = Object.keys(stylesheets);
stylesheetNames.forEach(function (key) {
	gulp.task("styles-" + key, function () {
		return gulp.src(stylesheets[key])
	            .pipe(concat(key + ".min.css"))
			.pipe(autoprefixer({
				browsers: ["> 0.5%", "ie 8-11"],
				remove: false
			}))
			.pipe(cleanCss({
				compatibility: "ie8"
			}))
			.pipe(gulp.dest("assets/css"));
	});
});
gulp.task("styles", ["styles-main",]);

gulp.task("sass", function () {
	return gulp.src("assets/css/style.scss")
            .pipe(sass().on("error", sass.logError))
			.pipe(gulp.dest("assets/css/"));
});
// Watch Files For Changes
gulp.task("watch", function () {
	gulp.watch("assets/css/**/*.scss", ["sass",]);
});

gulp.task("default", ["scripts", "styles",]);