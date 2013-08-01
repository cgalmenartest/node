/**
 * Userauth
 *
 * @module      :: Model
 * @description :: Store the authentication mechanisms for a user
 *
 */

module.exports = {

    attributes: {
        // Mapping to User model record
        userId: 'INTEGER',

        // Authentication information
        // Idenifies the provider used (passport strategy)
        provider: 'STRING',
        // The user's unique ID at this provider
        providerId: 'STRING',
        // OAuth access token
        accessToken: 'STRING',
        // OAuth refresh token
        refreshToken: 'STRING',
        // Time at which the accessToken expires
        refreshTime: 'DATETIME',
    }

};
