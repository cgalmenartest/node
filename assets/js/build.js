var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var stringify = require('stringify');

var file = fs.createWriteStream(path.join(__dirname, 'bundle.js'));

var bundled = browserify({ debug: true })
  //.transform({ global: true }, 'uglifyify')
  .transform(stringify(['.html']))
  .add(path.join(__dirname, 'backbone/app.js'))
  .bundle()
  .pipe(file);
