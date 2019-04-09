const gulp = require('gulp')
const cleanCSS = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const ts = require('gulp-typescript')

gulp.task('minifyCss', () => {
    return gulp.src('./client/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./server/public/css'))
})

gulp.task('minifyTs', () => {
    return gulp.src('./client/scripts/*.ts')
        .pipe(plumber({
            errorHandler: function (error) {
                console.error(error.message)
                this.emit('end')
            }
        }))
        .pipe(ts({
            noImplicitAny: true,
        }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./server/public/scripts'))
})

gulp.task('minifyJs', () => {
    return gulp.src('./client/scripts/*.ts')
        .pipe(plumber({
            errorHandler: function (error) {
                console.error(error.message)
                this.emit('end')
            }
        }))
        .pipe(ts({
            noImplicitAny: true,
        }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./server/public/scripts'))
})

gulp.task('watchClient', () => {
    if (process.env.NODE_ENV !== 'production') {
        gulp.watch(['./client/css/*.css'], gulp.series('minifyCss'))
        gulp.watch(['./client/scripts/*.ts'], gulp.series('minifyTs'))
    }
})