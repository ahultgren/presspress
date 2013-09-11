"use strict";

var gm = require('gm'),
// Vars
    defaultSize = {
      width: 200,
      height: 200,
      hard: true
    },
    sizes = [defaultSize];

gm = gm.subClass({imageMagick: true});


exports.addSize = function (width, height, hard) {
  sizes.push({
    width: width,
    height: height,
    hard: hard || false
  });
};

exports.resizeImage = function (imageStream, callback) {
  // Save original?
  var result = [],
      original = gm(imageStream, imageStream.filename)
        .autoOrient()
        .noProfile()
        .stream();

  result.push({
    filename: imageStream.filename,
    stream: original
  });

  //## Check if file already exists, append _1 or something

  //## each size, resize and push
  sizes.forEach(function (size) {
    var name = exports.makeSizeName(imageStream.filename, size),
        image;

    image = gm(original, name)
      //## Enable hard-cropping
      .resize(size.width, size.height, '>');

    result.push({
      filename: name,
      stream: image.stream()
    });
  });

  callback(null, result);
};

exports.makeSizeName = function (name, size) {
  name = name.split('.');
  return name.shift() + '-' + size.width + 'x' + size.height + '.' + name.join('.');
};
