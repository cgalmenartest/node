/**
 * FileController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var fs = require('fs');
var gm = require('gm');
var _ = require('underscore');
var async = require('async');

module.exports = {
  find: function(req, res) {
    // Get requests return the file metadata, post requests store files
    File.findOne({ where: { 'id': req.params.id }
                   //groupBy: [ 'id', 'userId', 'name', 'isPrivate', 'mimeType', 'size']
                 }, function (err, file) {
      // XXX TODO: This is a hack until the following issue is resolved:
      // https://github.com/balderdashy/waterline/issues/73
      delete file['data'];
      sails.log.debug('File:', file);
      // Make sure the user has access to the file
      res.send(file);
    });
  },

  // Get the contents of a file by id or name
  get: function(req, res) {
    if (!req.params.id) { return res.send(400, {message:'No file id specified.'}) }
    if (_.isFinite(req.params.id)) {
      // a File ID has been provided
      File.findOneById(req.params.id, function(err, f) {
        if (err) { return res.send(400, {message:'Error while finding file.'}) }
        if (!f || !f.data) { return res.send(400, {message:'Error while finding file.'}) }
        res.set('Content-Type', f.mimeType);
        res.set('Content-disposition', 'attachment; filename=' + f.name);
        // Don't let browsers cache the response
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
        res.set('Pragma', 'no-cache'); // HTTP 1.0.
        res.set('Expires', '0'); // Proxies.
        return res.send(f.data);
      });
    } else {
      return res.send(400, {message: 'Abiguous file; please use file id.'});
    }
  },
  
  create: function(req, res) {
    sails.log.debug('CREATE FILE!');
    // Create only accepts post
    if (req.route.method != 'post') { return res.send(400, {message:'Unsupported operation.'}) }
    // If a file wasn't included, abort.
    sails.log.debug('Files:',req.files);
    sails.log.debug('Param:',req.params);
    sails.log.debug('Body: ',req.body);
    if (!req.files || req.files.length === 0) { return res.send(400, {message:'Must provide file data.'})}

    var results = [];

    var processFile = function (upload, done) {
      // Read the temporary file
      sails.log.debug('processing...', upload);
      fs.readFile(upload.path, function (err, fdata) {
        if (err || !fdata) { return done({message:'Error storing file.'}); }
        // Create a file object to put in the database.
        var f = {
          userId: req.user[0].id,
          name: upload.name,
          mimeType: upload.type || upload.headers['content-type'],
          size: fdata.length,
          data: fdata
        };
        // if the type of the file should be a square image
        // resize the image before storing it.
        if (req.param('type') == 'image_square') {
          gm(f.data, 'photo.jpg')
          .size(function (err, size) {
            if (err || !size) {
              return done({ message: 'Error with file: it is probably not an image. ', error: err });
            }
            if (size.width == size.height) {
              sails.log.debug('Create File:', f);
              File.create(f, function(err, newFile) {
                if (err || !newFile) { return done({ message:'Error storing file.', error: err }); }
                delete newFile['data'];
                results.push(newFile);
                return done();
              });
              return;
            }
            var newSize = Math.min(size.width, size.height);
            gm(f.data, 'photo.jpg')
            .crop(newSize, newSize, ((size.width - newSize) / 2), ((size.height - newSize) / 2))
            .toBuffer(function (err, buffer) {
              f.data = buffer;
              f.size = buffer.length;
              sails.log.debug('Create File:', f);
              File.create(f, function(err, newFile) {
                if (err || !newFile) { return done({ message:'Error storing file.', error: err }); }
                delete newFile['data'];
                results.push(newFile);
                return done();
              });
            });
          });
        } else {
          sails.log.debug('Create File:', f);
          File.create(f, function(err, newFile) {
            if (err || !newFile) { return done({ message:'Error storing file.', error: err }); }
            delete newFile['data'];
            results.push(newFile);
            return done();
          });
        }
      });
    };

    async.each(req.files.files, processFile, function (err) {
      if (err) {
        return res.send(400, err);
      }
      sails.log.debug('Results:', results);
      res.set('Content-Type', 'text/html');
      var wrapper = '<textarea data-type="application/json">';
      wrapper += JSON.stringify(results);
      wrapper += '</textarea>';
      sails.log.debug(wrapper);
      return res.send(wrapper);
    });

  },

  // XXX TODO: Remove before release/production.
  // Test function that puts a file from /tmp/binary.png into the database
  // For testing, just an easy why to put something in the DB.
  test: function(req, res) {
    sails.log.debug('test');
    var f = { userId: 1,
              mimeType: 'image/png'
            };
    fs.readFile('/tmp/binary.png', function (err, data) {
      f.size = data.length;
      f.data = data;
      sails.log.debug(f);
      File.create(f).done(function (err, fi) {
        sails.log.debug(err);
        sails.log.debug(fi);
        sails.log.debug(Buffer.isBuffer(fi.data));
        sails.log.debug(fi.data.length);
        res.set('Content-Type', fi.mimeType);
        res.send(fi.data);
      });
    });
  },

  // XXX TODO: Remove before release/production.
  // Sample HTML form to upload a file and test the create function.
  // Make sure you're logged in!
  testupload: function(req, res) {
    res.view();
  }
};
