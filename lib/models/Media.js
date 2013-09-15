"use strict";

var mongoose = require('mongoose'),
    Media;


/**
 * Media
 * 
 * Model for all media/files/images etc
 */

Media = new mongoose.Schema({
  type: { type: String, 'default': 'image' },
  name: String,
  meta: {}
});


/* Hooks
============================================================================= */


/* Virtuals
============================================================================= */


/* Methods
============================================================================= */


module.exports = Media;
