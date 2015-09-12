// Build file for muon-elements. Currently in need of cleaning and de-duping.

var fs = require('fs')
var path = require('path')
var gulp = require('gulp')
var rename = require('gulp-rename')
var replace = require('gulp-replace')
var concat = require('gulp-concat')
var minifyHTML = require('gulp-minify-html')
var minifyCSS = require('gulp-minify-css')
var less = require('gulp-less')

// Transforms for inlining file references inside html files.
var inlineReferences = function(file) {
  var fileName = file.history[0]
  var contents = file._contents.toString()

  var transformScripts = function(fullMatch, match) {
    var normalizedPath = path.resolve(path.join(path.dirname(fileName), match))

    try {
      var embedContents = fs.readFileSync(normalizedPath, {encoding: 'utf-8'})
      var completedReplace = '<script>\n' + embedContents + '\n'
      return completedReplace
    } catch (e) {
      return
    }
  }

  var transformStyles = function(fullMatch, match) {
    var normalizedPath = path.resolve(path.join(path.dirname(fileName), match))

    try {
      var embedContents = fs.readFileSync(normalizedPath, {encoding: 'utf-8'})
      var completedReplace = '<style>\n' + embedContents + '\n</style>'
      return completedReplace
    } catch (e) {
      return
    }
  }

  contents = contents.replace(/<script\s+?src=["'](.+?)["']\s*?>/ig, transformScripts)
  file._contents = contents.replace(/<link.+?href=["'](.+?)["']\s*?\/>/ig, transformStyles)
  return file
}

gulp.task('combine-all', function() {
  gulp.src('./components/*/*.html')
  .on('data', inlineReferences)
  .pipe(concat('muon-elements-all.html'))
  .pipe(minifyHTML())
  .pipe(gulp.dest('./dist/'))
})

gulp.task('combine-ui', function() {
  gulp.src(['./components/layout/*.html', './components/input/*.html'])
  .on('data', inlineReferences)
  .pipe(concat('muon-elements-ui.html'))
  .pipe(minifyHTML())
  .pipe(gulp.dest('./dist/'))
})

gulp.task('compile-all', function() {
  gulp.src('./components/**/*.html')
  .on('data', inlineReferences)
  .pipe(minifyHTML())
  .pipe(gulp.dest('./dist/components/'))
})

// Theme tasks
gulp.task('build-themes', function(done) {
  // Compile the base (layout) theme.
  gulp.src('./themes/base/theme-base.less')
  .pipe(less({
    paths: [ path.join(__dirname, 'themes', 'base') ],
  }))
  .on('error', function(e) {
    console.log('Compilation Error: \n' + e.message)
    this.emit('end')
  })
  .pipe(minifyCSS())
  .pipe(gulp.dest('./dist/'))

  // Compile the muon theme.
  gulp.src('./themes/muon/theme-muon.less')
  .pipe(less({
    paths: [ path.join(__dirname, 'themes', 'muon') ],
  }))
  .on('error', function(e) {
    console.log('Compilation Error: \n' + e.message)
    this.emit('end')
  })
  .pipe(minifyCSS())
  .pipe(gulp.dest('./dist/'))
  .on('end', done)
})

gulp.task('build-combined-theme', function() {
  // Combine the base and muon (default) themes
  gulp.src([
    './dist/theme-base.css',
    './dist/theme-muon.css',
  ])
  .pipe(concat('theme-combined.css'))
  .pipe(gulp.dest('./dist/'))
})

gulp.task('default', function() {
  gulp.watch(['./components/**/*', './controllers/**/*'], ['combine-all', 'combine-ui', 'compile-all'])
  gulp.watch('./themes/**/*.less', ['build-themes'])
  gulp.watch(['./dist/theme-base.css', './dist/theme-muon.css'], ['build-combined-theme'])
})
