module.exports.models = {

  /***************************************************************************
  *                                                                          *
  * Your app's default connection. i.e. the name of one of your app's        *
  * connections (see `config/connections.js`)                                *
  *                                                                          *
  ***************************************************************************/
  connection: 'postgresql',

  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * See http://sailsjs.org/#/documentation/concepts/ORM/model-settings.html  *
  *                                                                          *
  * Midas Note: Due to the implementation details of soft delete in our      *
  * fork of the postgres sails adapter                                       *
  * (https://github.com/18F/sails-postgresql), the migrate mode must be      *
  * set to safe. Setting it to a different value will not function or will   *
  * cause the deletedAt columns to be removed from the database.             *
  ***************************************************************************/
  migrate: 'alter'

};
