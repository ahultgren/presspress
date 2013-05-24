"use strict";

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    interval: 200,
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        strict: true,
        globalstrict: true
      },
      files: {
        src: ['Gruntfile.js', 'package.json', 'lib/*.js', 'lib/controllers/**/*.js', 'lib/models/**/*.js', 'lib/utils/**/*.js', 'demo/*.js']
      }
    },
    watch: {
      files: ['<%= jshint.files.src %>'],
      tasks: ['default']
    }
  });

  // npm tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint']);
};
