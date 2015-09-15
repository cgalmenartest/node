console.log('Loading... ', __filename);

module.exports.models = {

  /***************************************************************************
  *                                                                          *
  * Your app's default connection. i.e. the name of one of your app's        *
  * connections (see `config/connections.js`)                                *
  *                                                                          *
  ***************************************************************************/
  connection: process.env.DATASTORE || 'postgresql',

  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * See http://sailsjs.org/#/documentation/concepts/ORM/model-settings.html  *
  *                                                                          *
  * Midas Note: Schema is created in development when you run 'sails lift'.  *
  * Typically that is when you run 'make init' on setup.  In production,     *
  * sails should not modify your schema, but it is fine to change this to    *
  * 'safe' after that initial schema creation step.                          *
  ***************************************************************************/
  migrate: 'safe'

};
