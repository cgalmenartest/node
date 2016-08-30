module.exports = function ( grunt ) {

  grunt.config.set( 'browserSync', {
    bsFiles: {
      src: [ 'assets/**/*' ],
    },
    options: {
      proxy: 'localhost:1337',
      watchTask: true,
    }
  } );

  grunt.loadNpmTasks( 'grunt-browser-sync' );

};
