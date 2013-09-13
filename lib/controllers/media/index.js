"use strict";

var 
// External modules
    multiparty = require('multiparty'),
    async = require('async'),
// Core modules
    hooks = require('../hooks'),
    route = require('../route'),
    admin = require('../admin'),
// Internal modules
    uploader = require('./uploader'),
    resizer = require('./resizer');


/* Initialization
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    exports.init(app, uploader.init.bind(uploader, app, next));
  });
  next();
});

exports.init = function (app, callback) {
  route.add({
    path: '/admin/media',
    method: 'GET',
    view: '../../views/media/upload.jade',
    callbacks: uploadView
  });

  route.add({
    path: '/admin/media',
    method: 'POST',
    callbacks: uploadPost
  });

  admin.addPage({
    route: '/admin/media',
    title: 'Media'
  });

  callback();
};

function uploadView (req, res, next) {
  next();
}

function uploadPost (req, res, next) {
  var form = new multiparty.Form();

  form.on('part', function (part) {
    //## Check that it's in image here?
    //## At least check that it has a filename?
    async.each(resizer.resizeImage(part),
      uploader.saveFileStream,
    function (err, result) {
      if(err) {
        console.error(err);
      }

      //## This is assuming there's only one part. How to handle more?
      res.redirect('/admin/media');
    });
  });

  form.on('error', console.error);
  form.parse(req);
}
