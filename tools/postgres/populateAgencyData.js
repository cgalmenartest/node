var Sails = require( 'sails' );
var _  = require( 'underscore' );
var async = require( 'async' );


var options = {
  connections: {
    postgresql: {
      softDelete: false,
    },
  },
};

Sails.lift( options, function ( error, sails ) {

  if ( error ) {
    return console.error( error );
  }

  // Create a function that serializes the Agency name
  // example:
  // {
  //   type: "agency",
  //   name: "General Services Administration (GSA)",
  //   data: null,
  //   id: 182,
  //   createdAt: "2014-10-29T17:56:17.913Z",
  //   updatedAt: "2014-10-29T17:56:17.913Z"
  // },
  //
  // And populates the data JSON to include the following properties
  // example:
  // {
  //   domain: 'EMAIL_ADDRESS_DOMAIN',
  //   abbr: 'AGENCY_ABBREVIATION_FROM_PAREN',
  //   slug: 'LOWERCASE_AGENCY_ABBR',
  //   allowRestrictAgency: 'TRUE OR FALSE' <== should probably default to true to avoid issues with new agencies
  // }

} );
