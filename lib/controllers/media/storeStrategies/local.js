"use strict";

var 
// Node deps
    path = require('path'),
    fs = require('fs'),
// Core deps
    route = require('../../route'),
// External deps
    async = require('async'),
    express = require('express'),
    send = require('send'),
// Vars
    // Default uploads path is the root of the site /uploads
    uploadsDir = path.join(path.dirname(process.mainModule.filename), '/uploads'),
    uploadsUrl = '/uploads';


/**
 * .start(app, callback)
 *
 * Called when the app is started. Sets upload url and dir
 * Required by all store strategies
 */

exports.start = function (app, callback) {
  var newDir = app.set('mediaRootDir'),
      newUrl = app.set('mediaRootUrl');

  // Replace defaults
  if(newDir) {
    uploadsDir = newDir;
  }
  if(newUrl) {
    uploadsUrl = newUrl;
  }

  // Create route
  route.add({
    path: uploadsUrl + '*',
    callbacks: function (req, res, next) {
      send(req, req.path.substring(uploadsUrl.length))
        .root(uploadsDir)
        .on('error', next)
        .pipe(res);
    }
  });

  // Make sure dir exists
  ensureUploadsDir(callback);
};


/**
 * .save(stream, callback)
 *
 * Stores a file
 * Required by all store strategies
 */

exports.save = function (stream, callback) {
  newFileName(stream.filename, stream.size, function (err, filename) {
    var saveStream;

    if(err) {
      return callback(err);
    }

    saveStream = fs.createWriteStream(path.join(uploadsDir, filename));

    saveStream.on('error', callback);
    saveStream.on('finish', function () {
      callback(null, {
        filename: filename,
        url: makeUrl(filename),
        size: stream.size
      });
    });

    stream.pipe(saveStream);
  });
};


/* Private functions
============================================================================= */

function ensureUploadsDir (callback) {
  fs.exists(uploadsDir, function (exists) {
    if(!exists) {
      fs.mkdir(uploadsDir, callback);
    }
    else if(callback) {
      callback();
    }
  });
}

function newFileName (name, size, callback) {
  var iterations = 0,
      newName = name,
      unique = false;

  async.whilst(function () {
    if(iterations) {
      newName = name.split('.');
      newName = newName.shift() + '_' + iterations + '.' + newName.join('.');
    }
    return unique === false;
  },
  function (again) {
    fs.exists(path.join(uploadsDir, newName), function (exists) {
      if(exists) {
        iterations++;
      }
      else {
        unique = true;
      }

      again();
    });
  },
  function done (err) {
    callback(err, sizifyName(newName, size));
  });
}

function sizifyName (name, size) {
  if(size) {
    name = name.split('.');
    name = name.shift() + '-' + size.width + 'x' + size.height + (size.hard && '_hard' || '') + '.' + name.join('.');
  }

  return name;
}

function makeUrl (filename) {
  return uploadsUrl + '/' + filename;
}
