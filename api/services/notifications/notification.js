/**
 * Source definition for
 *
 * @module    :: Source
 * @description ::
 */
 var util = require("util");
 var events = require("events");
 var _ = require('underscore');
 var async = require('async');

module.exports = {

	passThrough: function(fields, settings, cb){
		cb(null, {});
	}

}