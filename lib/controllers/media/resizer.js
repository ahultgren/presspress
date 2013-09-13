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

exports.resizeImage = function (imageStream) {
  // Save original?
  var streams = [],
      original,
      name = imageStream.filename;

  original = gm(imageStream, name)
    .autoOrient()
    .noProfile()
    .stream();

  original.filename = name;

  streams.push(original);

  // For each size, resize and push
  sizes.forEach(function (size) {
    var image = gm(original, name)
          .gravity(size.gravity || 'Center');

    if(size.hard) {
      // Only resize if larger and fit outside of box
      // Crop exactly to box
      image = image.resize(size.width, size.height, '^>')
        .crop(size.width, size.height);
    }
    else {
      // Fit inside of box
      image = image.resize(size.width, size.height);
    }
    
    image = image.stream();

    image.filename = name;
    image.size = size;
    streams.push(image);
  });

  return streams;
};
