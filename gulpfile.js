const gulp = require('gulp')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')

sass.compiler = require('node-sass')

gulp.task('minifyCss', () => {
    return gulp.src('./client/css/*.scss')
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./server/public/css'))
})

gulp.task('watchClient', () => {
    if (process.env.NODE_ENV !== 'production') {
        gulp.watch(['./client/css/*.scss'], gulp.series('minifyCss'))
    }
})