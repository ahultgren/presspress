"use strict";

/**
 * public
 *
 * Handles dynamically added static files. Any script, image or whatever that
 * one day might be sent to the client should be added through this controller.
 */


/* Private vars
============================================================================= */

var 
// Dependencies
    async = require('async'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    dot = require('dot'),
    express = require('express'),
// Internal dependencies
    hooks = require('./index').hooks,
// Vars
    scriptTemplate = dot.template('<script type="text/javascript" src="{{= it.uri + (it.modified ? "?ver=" + it.modified : "") }}"></script>'),
    styleTemplate = dot.template('<link rel="stylesheet" href="{{= it.uri + (it.modified ? "?ver=" + it.modified : "") }}">');


/* Initialization
============================================================================= */

hooks.on('hooks.listen', function (hooks, next) {
  hooks.on('render', exports.enqueue);
  hooks.on('core.init', function (app, next) {
    express.response.enqueueScript = enqueueScript;
    express.response.enqueueStyle = enqueueStyle;
    next();
  });

  hooks.on('render.first', function (req, res, next) {
    res._enqueued = [];
    next();
  });

  next();
});


/* Public vars
============================================================================= */

exports.files = {};


/* Private methods
============================================================================= */

function find (uri, callback) {
  callback(null, exports.files[uri]);
}

function makeScript (item, done) {
  if(item.modified === undefined && !item.uri.match(/^https*:\/\//)) {
    item.modified = exports.files[item.uri].modified;
  }

  var template = item.type === 'style' ? styleTemplate : scriptTemplate;

  done(null, template(item));
}

function enqueueScript () {
  /*jshint validthis:true */
  var res = this,
      scripts = Array.prototype.slice.call(arguments), i, l;

  for(i = 0, l = scripts.length; i < l; i++) {
    scripts[i].type = 'script';
    res._enqueued.push(scripts[i]);
  }
}

function enqueueStyle () {
  /*jshint validthis:true */
  var res = this,
      styles = Array.prototype.slice.call(arguments), i, l;

  for(i = 0, l = styles.length; i < l; i++) {
    styles[i].type = 'style';
    res._enqueued.push(styles[i]);
  }
}


/* Public methods
============================================================================= */

/**
 * exports.static
 *
 * Middleware for serving registered files
 */

exports.static = function (req, res, next) {
  if(exports.files.hasOwnProperty(req.path)) {
    res.sendfile(exports.files[req.path].path);
  }
  else {
    next();
  }
};


/**
 * exports.addFiles
 *
 * Add one or more files which shall be available to clients.
 *
 * @param files (object) Object where keys are the public path and values are
 * the full internal path.
 * @param callback (function) Callback receiving err|null
 * @return (this) Self for chaining
 */

exports.addFiles = function (files, callback) {
  var failed = [];

  callback = callback || function(){};

  async.series([
    function (next) {
      // Check if file already exists
      async.each(Object.keys(files), function (uri, next) {
        find(uri, function (err, file) {
          if(file) {
            failed.push(uri);
            delete files[uri];
          }

          next();
        });
      }, next);
    },
    function (next) {
      // Add files that doesn't exist
      _.extend(exports.files, files);
      next();
    }
  ],
  function (err) {
    if(!err && failed.length) {
      // Notify caller that some uri's are unavailable
      err = new Error('The following uri\'s were already added and were not changed: ' + failed.join(', '));
    }

    callback(err, Object.keys(files), failed);
  });

  return exports;
};


/**
 * addFolder
 *
 * Register a directory containing publicly accessible static files
 *
 * @param root (string) Full internal path to folder
 * @param url (string) Base path relative to the site's base url
 * @param callback (url) Called when done
 * @return (this) Self for chaining
 */

exports.addFolder = function(dir, url, callback) {
  var files = {};

  (function addFile (dir, url, done) {
    fs.stat(dir, function (err, stat) {
      if(err) {
        return done(err);
      }

      if(!stat.isDirectory()) {
        files[url] = {
          path: dir,
          modified: stat.mtime.getTime()
        };

        done();
      }
      else {
        fs.readdir(dir, function (err, items) {
          async.each(items, function (item, next) {
            addFile(path.join(dir, item), path.join(url, item), next);
          }, done);
        });
      }
    });
  }(dir, url, function (err) {
    exports.addFiles(files, callback);
  }));

  return exports;
};


/**
 * enqueue
 *
 * Add scripts and styles which will be written when the theme calls head()
 *
 * @param paramName (type) Description
 * @return (this) Self for chaining
 */

exports.enqueue = function (res, next) {
  // Helper to merge memo with script
  function merge (memo, callback) {
    return function (err, script) {
      callback(null, memo + script);
    }
  }

  async.parallel([
    function (next) {
      // Head items
      async.reduce(res._enqueued, '', function (memo, item, next) {
        if(!item.foot) {
          makeScript(item, merge(memo, next));
        }
        else {
          next(null, memo);
        }
      }, next);
    },
    function (next) {
      // Foot items
      async.reduce(res._enqueued, '', function (memo, item, next) {
        if(item.foot) {
          makeScript(item, merge(memo, next));
        }
        else {
          next(null, memo);
        }
      }, next);
    }
  ],
  function (err, enqueued) {
    res._data._head.push(enqueued[0]);
    res._data._foot.push(enqueued[1]);

    next(err);
  });
};
