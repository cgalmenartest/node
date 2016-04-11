var _ = require('underscore');


module.exports = function(grunt) {

  grunt.config.set('sass', {
    dev: {

      // sass: {

      //   options: {

      //     style: 'expanded',
      //     sourcemaps: true,

      //     includePaths: _.flatten([
      //       require('bourbon').includePaths,
      //       'assets/styles',
      //       'assets/styles/vendor',
      //       'node_modules',
      //     ]),

      //   }, 
      //   dist: {
      //       files: {
      //           'assets/styles/FOO.css': 'assets/styles/main.scss'
      //       }
      //   },
      //   app: {
      //     options: {
      //       style: 'compressed',
      //     },
      //     files: {
      //       'assets/build/css/midas.css': [
      //         'assets/styles/main.scss',
      //       ],
      //     },

      //   },
      // },

      files: [{
        expand: true,
        cwd: 'assets/styles/',
        loadPath: [
          'assets/styles',
          'assets/styles/vendor',
          'node_modules',
        ],
        src: ['main.scss'],
        dest: '.tmp/public/styles/',
        ext: '.css',
      }]
    }
  });

  grunt.loadNpmTasks('grunt-sass');
};
