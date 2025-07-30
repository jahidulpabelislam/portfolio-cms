const gulp = require("gulp");

const HubRegistry = require("gulp-hub");

let srcs = [];

const env = process.env.NODE_ENV || "production";
if (env !== "production") {
    srcs.push("./vendor/jpi/personal-core/dev/gulpfile.js");
}

const hub = new HubRegistry(srcs);

gulp.registry(hub);
