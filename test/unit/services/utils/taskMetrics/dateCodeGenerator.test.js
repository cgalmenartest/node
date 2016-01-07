var async = require('async');
var assert = require('chai').assert;
var _ = require('underscore');

var conf = require('../../../../api/sails/helpers/config');

DateCodeGenerator = require('../../../../../api/services/utils/taskMetrics/dateCodeGenerator');

describe('DateCodeGenerator', function() {
  function generateCode(dateString, groupParam) {
    generator = new DateCodeGenerator(groupParam);
    return generator.create(dateString);
  }

  it("maps group by params to codes in the date decorator", function() {
    assert.equal(generateCode("11/1/2015"), "2016");
    assert.equal(generateCode("11/1/2015", "year"), "2015");
    assert.equal(generateCode("11/1/2015", "month"), "201511");
    assert.equal(generateCode("11/1/2015", "quarter"), "20154");
    assert.equal(generateCode("11/1/2015", "fyquarter"), "20161");
  });
});


