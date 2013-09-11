"use strict";

var 
// External modules
    multiparty = require('multiparty'),
// Core modules
    hooks = require('../hooks'),
    route = require('../route'),
    admin = require('../admin'),
// Internal modules
    localstore = require('./localstore'),
    resizer = require('./resizer');


/* Initialization
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('core.init', function (app, next) {
    exports.init(app, localstore.init.bind(localstore, app, next));
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
  // listen on form events on something?
  console.log("form", req.form);
  console.log("is multi", req.is('multipart/form-data'));

  var form = new multiparty.Form();

  form.on('part', function (part) {
    console.log("file", part.filename);
    resizer.resizeImage(part).pipe(localstore.saveFileStream(part.filename));
  });

  form.on('end', function () {
    console.log("end");
  });

  form.on('error', console.log);

  form.parse(req);

  res.redirect('/admin/media');
}
