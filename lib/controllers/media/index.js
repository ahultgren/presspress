"use strict";

var 
// External modules
    multiparty = require('multiparty'),
    async = require('async'),
    mongoose = require('mongoose'),
// Core modules
    hooks = require('../hooks'),
    route = require('../route'),
    admin = require('../admin'),
    flow = require('../../utils').flow,
// Internal modules
    uploader = require('./uploader'),
    resizer = require('./resizer'),
    sizes = require('./sizes');


/* Initialization
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    exports.init(app, function () {
      uploader.init(app, next);
    });
  });
  hooks.on('core.start', uploader.start);
  next();
});


/* Public methods
============================================================================= */

exports.init = function (app, callback) {
  route.add({
    path: '/admin/media',
    method: 'GET',
    view: '../../views/media/upload.jade',
    callbacks: exports.uploadView
  });

  route.add({
    path: '/admin/media',
    method: 'POST',
    callbacks: [exports.uploadPost, flow.redirect('/admin/media')]
  });

  admin.addPage({
    route: '/admin/media',
    title: 'Media'
  });

  callback();
};


exports.addImageSize = function (name, width, height, hard) {
  sizes.push({
    name: name,
    width: width,
    height: height,
    hard: hard || false
  });
};


exports.uploadView = function (req, res, next) {
  var Media = mongoose.model('Media');
  
  Media.find({}, function (err, files) {
    res.data({
      posts: files
    });
    next(err);
  });
};


exports.uploadPost = function (req, res, next) {
  var form = new multiparty.Form(),
      parts = 0,
      formIsDone = false;

  form.on('part', function (part) {
    //## Check that it's in image here?
    //## At least check that it has a filename?
    parts++;

    async.waterfall([
      async.map.bind(async, resizer.resizeImage(part), uploader.saveFileStream),
      storeInDb
    ], done);
  });

  form.on('error', console.error);
  form.on('end', function () {
    //## Is part.end always after form.end?
    formIsDone = true;
  });

  form.parse(req);

  function done (err) {
    if(err) {
      console.error(err);
    }

    if(--parts !== 0 && !formIsDone) {
      return;
    }

    next(err);
  }
};


/* Private
============================================================================= */

function storeInDb (files, callback) {
  var urls = {
    original: files[0]
  }, key, i, l;

  // i = 1, exclude the original size
  for(i = 1, l = files.length; i < l; i++) {
    key = files[i].size.name;
    urls[key] = files[i];
  }

  mongoose.model('Media').create({
    name: files[0].filename,
    meta: urls,
    type: 'image'
  }, callback);
}
