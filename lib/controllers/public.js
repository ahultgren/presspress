"use strict";

/**
 * public
 *
 * Handles dynamically added static files. Any script, image or whatever that
 * one day might be sent to the client should be added through this controller.
 */


/* Private vars
============================================================================= */

var 
// Dependencies
    async = require('async'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path');


/* Public vars
============================================================================= */

exports.files = {};


/* Private methods
============================================================================= */

function find (uri, callback) {
  callback(null, exports.files[uri]);
}


/* Public methods
============================================================================= */

/**
 * exports.static
 *
 * Middleware for serving registered files
 */

exports.static = function (req, res, next) {
  if(exports.files.hasOwnProperty(req.path)) {
    res.sendfile(exports.files[req.path]);
  }
  else {
    next();
  }
};


/**
 * exports.addFiles
 *
 * Add one or more files which shall be available to clients.
 *
 * @param files (object) Object where keys are the public path and values are
 * the full internal path.
 * @param callback (function) Callback receiving err|null
 * @return (this) Self for chaining
 */

exports.addFiles = function (files, callback) {
  var failed = [];

  callback = callback || function(){};

  async.series([
    function (next) {
      // Check if file already exists
      async.each(Object.keys(files), function (uri, next) {
        find(uri, function (err, file) {
          if(file) {
            failed.push(uri);
            delete files[uri];
          }

          next();
        });
      }, next);
    },
    function (next) {
      // Add files that doesn't exist
      _.extend(exports.files, files);
      next();
    }
  ],
  function (err) {
    if(!err && failed.length) {
      // Notify caller that some uri's are unavailable
      err = new Error('The following uri\'s were already added and were not changed: ' + failed.join(', '));
    }

    callback(err, Object.keys(files), failed);
  });
};



/**
 * addFolder
 *
 * Register a directory containing publicly accessible static files
 *
 * @param root (string) Full internal path to folder
 * @param url (string) Base path relative to the site's base url
 * @param callback (url) Called when done
 * @return (this) Self for chaining
 */

exports.addFolder = function(dir, url, callback) {
  var files = {};

  (function addFile (dir, url, done) {
    fs.stat(dir, function (err, stat) {
      if(err) {
        return done(err);
      }

      if(!stat.isDirectory()) {
        files[url] = dir;
        done();
      }
      else {
        fs.readdir(dir, function (err, items) {
          async.each(items, function (item, next) {
            addFile(path.join(dir, item), path.join(url, item), next);
          }, done);
        });
      }
    });
  }(dir, url, function (err) {
    exports.addFiles(files, callback);
  }));
};
