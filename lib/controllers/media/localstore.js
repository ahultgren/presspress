"use strict";

var path = require('path'),
    fs = require('fs'),
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
  })
};

exports.init = function (app, callback) {
  // Make sure the uploadDir exists when the app is starting
  // The dir should preferably be set before init?
  exports.ensureUploadsDir(callback);
};

exports.saveFileStream = function (filename) {
  //##fs.rename(file.path, path.join(uploadsDir, file.name), callback);
  console.log(path.join(uploadsDir, filename));
  return fs.createWriteStream(path.join(uploadsDir, filename));
};
