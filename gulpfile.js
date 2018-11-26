const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

// config
const STYLES = './css/styles.scss';
const INDEX = './index.pug';
const JS = './js/plugin/greatslider.jquery.js';

gulp.task('pug', () => {
  return gulp.src(INDEX)
    .pipe(pug().on('error', notify.onError('Error de compilación: index.pug')))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
});

gulp.task('sass', () => {
  return gulp.src(STYLES)
    .pipe(sass().on('error', notify.onError('Error de compilación: styles.scss')))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp.src(JS)
    .pipe(babel({
      plugins: 
      ['@babel/transform-runtime'],
      'presets': [
        ['@babel/env',
          {
            'targets': {
              'browsers': ['last 2 versions']
            }
          }
        ]
      ]
    }))
    .on('error', function (err) { console.log( err.toString() )})
    .pipe(uglify())
    .on('error', function (err) { console.log( err.toString() )})
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});


gulp.task('default', function() {
  browserSync.init({server: "./"});
  gulp.watch(STYLES, ['sass']);
  gulp.watch(JS, ['js']);
  gulp.watch(INDEX, ['pug']);
  console.clear();
});
