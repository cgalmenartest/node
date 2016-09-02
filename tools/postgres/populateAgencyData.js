var Sails = require( 'sails' );
var _  = require( 'underscore' );
var Promise = require( 'bluebird' );

/**
  * SailsJS options
  * The grunt tasks don't need to run for migrations, so they don't.
  */
var options = {
  hooks: {
    grunt: false,
  },
  connections: {
    postgresql: {
      softDelete: false,
    },
  },
};


/**
  * Lift command which kicks off the migration. Uses bluebird Promises to handle
  * the asynchronous nature of JavaScript and Waterline.
  */
Sails.lift( options, function ( error, sails ) {

  if ( error ) {
    return sails.log.error( error );
  }

  populateTags()
    .then( function ( saves ) {
      Promise.all( saves )
        .then( function () {
          done( error, sails );
        } );
    } );

} );

/**
  * The done callback which runs as the last thing.
  * @param { object } error A object representing an error.
  * @param { Sails } sails The Sails application instance.
  */
function done ( error, sails ) {
  if ( error ) {
    sails.log.error( 'Whoops! Something went wrong with the migration', error );
    return;
  }
  sails.log.info( 'All done!' );
  sails.log.info( 'Migration complete for adding agency#data JSON to the task db table.' );
  sails.lower();
  process.exit( 0 );
}

/**
  * A helper function to get an abbreviation from a name string.
  * @param { string } name A string which may or may not contain a `(ABBR)` abbreviation.
  * @return { object } The regular expression result.
  */
function getAbbr ( name ) {
  return /\(([A-Z]+)\)/.exec( name );
}

/**
  * The meat-and-potatoes function for populating all the tags.
  * This function returns a Promise which in turn returns an array of Promises
  * to resolve the record#save command.
  * @return { Sails#Waterline#Promise } This Promise is bluebird-like and is
  * returned by the Waterline ORM.
  */
function populateTags () {
  return TagEntity.find( { type: 'agency' } )
    .then( function ( tags ) {
      return _( tags ).map( function ( tag ) {
        var abbreviation = getAbbr( tag.name );
        if ( abbreviation  !== null ) {
          abbreviation = abbreviation[ 1 ];
          sails.log.info( `The abbreviation will be ${ abbreviation } for ${ tag.name }` );
          tag.data = {
            abbr: abbreviation,
            domain: `${ abbreviation.toLowerCase() }.gov`,
            slug: abbreviation.toLowerCase(),
            allowRestrictAgency: true,
          };
          return new Promise( function ( resolve, reject ) {
            tag.save( function ( error ) {
              if ( error ) {
                sails.log.error( `Whoops! There was an error`, error );
                reject( error );
                return;
              }
              sails.log.info( `Done saving ${ tag.name }` );
              sails.log.info( `    as agency#data = ${ JSON.stringify( tag.data ) }` );
              resolve();
            } );
          } );
        }
      } );
    } )
    .catch( function ( error ) {
      sails.log.error( 'Whoops! An error has occurred', error );
    } );
}
