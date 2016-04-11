var _ = require('underscore');


module.exports = function(grunt) {
  grunt.config.set('sass', {
    dev: {
      sass: {
        options: {
          style: 'expanded',
          sourcemaps: true,
          includePaths: _.flatten([
            require('bourbon').includePaths,
            'assets/styles',
            'assets/styles/vendor',
            'node_modules',
          ]),

        },
        app: {
          options: {
            style: 'compressed',
          },
          files: {
            'assets/build/css/midas.css': [
              'assets/styles/application.scss',
              'assets/styles/vendor.scss',
            ],
          },
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-sass');
};
