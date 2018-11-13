const gulp = require('gulp');
const babel = require('gulp-babel');

const npmDistDir = 'dist';

gulp.task('babel', () =>
  gulp
    .src('rencode.js')
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(gulp.dest(npmDistDir))
);

gulp.task('dist', ['babel']);

gulp.task('default', ['dist']);
