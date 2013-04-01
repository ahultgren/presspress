"use strict";

var accents = 'àáäâæåèéëêìíïîòóöôøùúüûýçñ',
    normals = 'aaaaaaeeeeiiiiooooouuuuycn',
    diacriticsRegexp = new RegExp('[' + accents + ']', 'ig');

module.exports = function (string) {
  return string.replace(diacriticsRegexp, function(s){
    return normals[accents.indexOf(s)];
  });
};
