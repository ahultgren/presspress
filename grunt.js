"use strict";
var pkg = require('./package.json');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/*.js', 'lib/*/*.js', 'lib/public/js/*.js', 'test/**/*.js']
    },
    less: {
      development: {
        files: {
          "lib/public/dist/presspress.css": "lib/public/less/presspress.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "lib/public/dist/presspress.css": "lib/public/less/presspress.less"
        }
      }
    },
    concat: {
      js: module.exports.js,
      css: module.exports.css
    },
    min: {
      js: module.exports.minjs
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {
        exports: true,
        window: true,
        document: true,
        jQuery: true // Not sure how to separate node linting from client side linting
      }
    }
  });

  // npm tasks
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task.
  grunt.registerTask('default', 'lint test less:development concat min');
};

module.exports.js = {
  src: [
    'lib/public/js/lib/bootstrap.js',
    'lib/public/js/lib/showdown.js',
    'lib/public/js/presspress.js',
    'lib/public/js/postifier.js',
    'lib/public/js/editor.js'
  ],
  dest: 'lib/public/dist/' + pkg.name + '.js'
};

module.exports.css = {
  src: [
    'lib/public/css/bootstrap.css',
    'lib/public/css/bootstrap-responsive.css',
    'lib/public/css/highlight.css',
    'lib/public/dist/presspress.css'
  ],
  dest: 'lib/public/dist/' + pkg.name + '.min.css'
};

module.exports.minjs = {
  src: [ '<config:concat.js.dest>' ],
  dest: 'lib/public/dist/<%= pkg.name %>.min.js'
};
