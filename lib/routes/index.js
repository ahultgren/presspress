"use strict";

exports.index = function (req, res, next) {
  res.view = 'theme/index';
  res.render('theme/index', function () {
    console.log("MJAU", arguments);
  });
};

exports.admin = require('./admin');