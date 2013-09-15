"use strict";

var 
// Node deps
    path = require('path'),
    fs = require('fs'),
// Core deps
    route = require('../route'),
// External deps
    async = require('async'),
    express = require('express'),
    send = require('send'),
// Vars
    // Default uploads path is the root of the site /uploads
    uploadsDir = path.join(path.dirname(process.mainModule.filename), '/uploads'),
    uploadsUrl = '/uploads';


exports.setUploadsDir = function (path, route, callback) {
  uploadsDir = path;
  uploadsUrl = route;

  exports.ensureUploadsDir(callback);
};

exports.ensureUploadsDir = function (callback) {
  fs.exists(uploadsDir, function (exists) {
    if(!exists) {
      fs.mkdir(uploadsDir, callback);
    }
    else if(callback) {
      callback();
    }
  });
};

exports.init = function (app, callback) {
  //## Expose a way to change uploads dir
  //## But it should be possible to set a custom upload strategy before init...
  app.setUploadsDir = exports.setUploadsDir;
};

exports.start = function (app, callback) {
  exports.ensureUploadsDir(callback);
  //## register a route for uploads?
  route.add({
    path: uploadsUrl + '*',
    callbacks: function (req, res, next) {
      send(req, req.path.substring(uploadsUrl.length))
        .root(uploadsDir)
        .on('error', next)
        .pipe(res);
    }
  });
};

exports.saveFileStream = function (imageStream, callback) {
  //## Use a chosen strategy instead of storing localy directly

  exports.newFileName(imageStream.filename, imageStream.size, function (err, filename) {
    var saveStream;

    if(err) {
      return callback(err);
    }

    saveStream = fs.createWriteStream(path.join(uploadsDir, filename));

    saveStream.on('error', callback);
    saveStream.on('finish', function () {
      callback(null, {
        filename: filename,
        url: exports.makeUrl(filename),
        size: imageStream.size
      });
    });

    imageStream.pipe(saveStream);
  });
};

exports.newFileName = function (name, size, callback) {
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
    callback(err, exports.sizifyName(newName, size));
  });
};

exports.sizifyName = function (name, size) {
  if(size) {
    name = name.split('.');
    name = name.shift() + '-' + size.width + 'x' + size.height + '.' + name.join('.');
  }

  return name;
};

exports.makeUrl = function (filename) {
  return uploadsUrl + '/' + filename;
};
