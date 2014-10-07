var path = require('path');

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: 'app',
          layout: function(type) {
            var renamedType = type;
            if (type === 'js') {
              renamedType = 'scripts';
            } else if (type === 'css') {
              renamedType = 'styles';
            }
            return path.join(renamedType, 'lib');
          }
        }
      }
    },
    concat: {
      dist: {
        src: ['build/opendap-viewer.js', 'build/controllers/*.js'],
        dest: 'app/scripts/opendap-viewer.js'
      }
    },
    traceur: {
      options: {
        modules: 'inline'
      },
      src: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.js'],
            dest: 'build'
          }
        ]
      }
    },
    watch: {
      traceur: {
        files: ['src/**/*.js'],
        tasks: ['build']
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-traceur');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['traceur', 'concat']);
  grunt.registerTask('default', ['build']);
};
