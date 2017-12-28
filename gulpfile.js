'use strict';

var gulp = require('gulp');
var electron = require('electron-connect').server.create();

// var electron = require('electron-connect').server.create({
//   useGlobalElectron: true,
//   logLevel: 2
// });

gulp.task('serve', () => {
  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('app.js', electron.restart);
});

gulp.task('reload:browser', function () {
  // Restart main process
  electron.restart();
});

gulp.task('reload:renderer', function () {
  // Reload renderer process
  electron.reload();
});

gulp.task('default', ['serve']);