import { task, src, series, dest, watch } from "gulp";
import eslint from "gulp-eslint-new";
import ts from "gulp-typescript";

const eslintConfig = "./.eslintrc.js";
const tsProject = ts.createProject("tsconfig.json");


task("lint", () => {
  return src(["**/*.ts", "!node_modules/*", "!build/*"])
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

task("build-ts", () => {
  return tsProject
    .src()
    .pipe(tsProject())
    .js
    .pipe(dest("build"));
});

task("watch", () => {
  watch(["**/*.ts", "!node_modules/*", "!build/*"], series("lint", "build-ts"));
});

task("build", series("lint", "build-ts"));