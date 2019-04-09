const gulp = require('gulp')
const cleanCSS = require('gulp-clean-css')

gulp.task('minifyCss', () => {
    return gulp.src('./client/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./server/public/css'))
})

gulp.task('watchClient', () => {
    if (process.env.NODE_ENV !== 'production') {
        gulp.watch(['./client/css/*.css'], gulp.series('minifyCss'))
    }
})