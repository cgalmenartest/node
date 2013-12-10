/**
 * FileController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var fs = require('fs');
var gm = require('gm');
var _ = require('underscore');

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
        // Don't let browsers cache the response
        res.set('Content-Type', f.mimeType);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
        res.set('Pragma', 'no-cache'); // HTTP 1.0.
        res.set('Expires', '0'); // Proxies.
        return res.send(f.data);
      });
    }
    if (_.isString(req.id)) {
      // a File name has been provided
      File.find({where: { name: req.id }}, function(err, f) {
        if (err || !f || f.length == 0 || !f[0].data) { }
        if (f.length > 1) { return res.send(400, {message:'Abiguous file; please use file id.'}) }
        res.set('Content-Type', f.mimeType);
        return res.send(f.data);
      });
    }
  },
  
  create: function(req, res) {
    sails.log.debug('CREATE FILE!');
    // Create only accepts post
    if (req.route.method != 'post') { return res.send(400, {message:'Unsupported operation.'}) }
    // If a file wasn't included, abort.
    if (!req.files.file) { return res.send(400, {message:'Must provide file data.'})}
    // Read the temporary file
    fs.readFile(req.files.file.path, function (err, fdata) {
      if (err || !fdata) { return res.send(400, {message:'Error storing file.'}) }
      // Create a file object to put in the database.
      var f = {
        userId: req.user[0].id,
        name: req.files.file.name,
        mimeType: req.files.file.type,
        size: fdata.length,
        data: fdata
      }
      // if the type of the file should be a square image
      // resize the image before storing it.
      if (req.param('type') == 'image_square') {
        gm(f.data, 'photo.jpg')
        .size(function (err, size) {
          if (err || !size) {
            return res.send(400, { message: 'Error with file: it is probably not an image. ', error: err });
          }
          if (size.width == size.height) {
            sails.log.debug('Create File:', f);
            File.create(f, function(err, newFile) {
              if (err || !newFile) { return res.send(400, { message:'Error storing file.', error: err }); }
              delete newFile['data'];
              return res.send(newFile);
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
              if (err || !newFile) { return res.send(400, { message:'Error storing file.', error: err }); }
              delete newFile['data'];
              return res.send(newFile);
            });
          });
        });
      } else {
        sails.log.debug('Create File:', f);
        File.create(f, function(err, newFile) {
          if (err || !newFile) { return res.send(400, { message:'Error storing file.', error: err }); }
          delete newFile['data'];
          return res.send(newFile);
        });
      }

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
