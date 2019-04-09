const gulp = require('gulp')
const cleanCSS = require('gulp-clean-css')

gulp.task('minifyCss', () => {
    return gulp.src('./client/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./server/public/css'))
})

gulp.task('moveJavaScript', () => {
    return gulp.src('./client/scripts/*.js')
        .pipe(gulp.dest('./server/public/scripts'))
})

gulp.task('watchClient', () => {
    if (process.env.NODE_ENV !== 'production') {
        gulp.watch(['./client/css/*.css'], gulp.series('minifyCss'))
        gulp.watch(['./client/scripts/*.js'], gulp.series('moveJavaScript'))
    }
})