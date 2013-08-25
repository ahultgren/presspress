"use strict";

/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    interval: 200,
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true
      },
      clientside: {
        files: {
          src: ['public/js/*.js']
        },
        options: {
          browser: true,
          jquery: true
        }
      },
      serverside: {
        files: {
          src: ['Gruntfile.js', 'index.js']
        },
        options: {
          strict: true,
          globalstrict: true,
          node: true,
          globals: {
            presspress: true
          }
        }
      }
    },
    less: {
      dist: {
        options: {
          yuicompress: true
        },
        files: {
          'public/dist/style.css': 'public/less/main.less'
        }
      }
    },
    concat: {
      js: {
        options: {
          separator: ';',
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        src: [
          'public/js/vendor/highlight.pack.js',
          'public/js/main.js'
        ],
        dest: 'public/dist/script.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'public/dist/script.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    watch: {
      files: ['<%= jshint.clientside.files.src %>', '<%= jshint.serverside.files.src %>', 'public/less/*.less'],
      tasks: ['default']
    }
  });

  // npm tasks
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint', 'less', 'concat', 'uglify']);
};
