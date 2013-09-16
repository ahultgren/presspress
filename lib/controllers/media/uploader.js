"use strict";

var defaultStrategy = './storeStrategies/local';


exports.storeStrategy = null;


exports.init = function (app, callback) {
  app.set('mediaStoreStrategy', defaultStrategy);
  callback();
};

exports.start = function (app, callback) {
  // Activate chosen store strategy
  var strategy = app.set('mediaStoreStrategy');

  if(!strategy) {
    strategy = require(defaultStrategy);
  }

  if(typeof strategy === 'string') {
    exports.storeStrategy = require(strategy);
  }
  else {
    exports.storeStrategy = strategy;
  }

  exports.storeStrategy.start(app, callback);
};

exports.saveFileStream = function (stream, callback) {
  exports.storeStrategy.save(stream, callback);
};
