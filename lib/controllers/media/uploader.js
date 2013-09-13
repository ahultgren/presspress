"use strict";

var path = require('path'),
    fs = require('fs'),
    async = require('async'),
    // Default uploads path is the root of the site /uploads
    uploadsDir = path.join(path.dirname(process.mainModule.filename), '/uploads');


exports.setUploadsDir = function (path, callback) {
  uploadsDir = path;

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
  // Make sure the uploadDir exists when the app is starting
  // The dir should preferably be set before init?
  exports.ensureUploadsDir(callback);
};

exports.saveFileStream = function (imageStream, callback) {
  //## Use a chosen strategy instead of storing localy
  exports.newFileName(imageStream.filename, imageStream.size, function (err, filename) {
    var saveStream;

    if(err) {
      return callback(err);
    }

    saveStream = fs.createWriteStream(path.join(uploadsDir, filename));

    saveStream.on('finish', callback);
    saveStream.on('error', callback);

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
