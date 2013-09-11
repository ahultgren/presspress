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
  // How to stream multiple images?
  return gm(imageStream, imageStream.filename)
    .autoOrient()
    .noProfile()
    .stream();
};
