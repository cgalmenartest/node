var assert = require('chai').assert;

var conf = require('../../../../api/sails/helpers/config');

var DateDecorator = require('../../../../../api/services/utils/taskMetrics/dateDecorator');

describe('ToFiscalDate', function() {
  var decorator, altDecorator;
  describe('when there is no input', function() {
    beforeEach(function() {
      input = undefined;
      decorator = new DateDecorator(undefined);
    });

    it('returns undefined for everything', function() {
      assert.equal(decorator.fiscalYear(), undefined);
      assert.equal(decorator.calendarYear(), undefined);
      assert.equal(decorator.calendarYearMonth(), undefined);
      assert.equal(decorator.calendarYearWeek(), undefined);
      assert.equal(decorator.calendarYearQuarter(), undefined);
      assert.equal(decorator.fiscalYearQuarter(), undefined);
    });
  });

  describe('when there is a valid input', function() {
    beforeEach(function() {
      decorator = new DateDecorator("12/13/14");
      altDecorator = new DateDecorator("1/23/2014");
    });

    it("calculates the fiscal year properly", function() {
      assert.equal(decorator.fiscalYear(), 2015);
      assert.equal(altDecorator.fiscalYear(), 2014);
    });

    it('calendarYear provides a delegate for getting the full year', function() {
      assert.equal(decorator.calendarYear(), 2014);
      assert.equal(altDecorator.calendarYear(), 2014);
    });

    it('calendarYearMonth builds a string with the full year and month', function() {
      assert.equal(decorator.calendarYearMonth(), '201412');
      assert.equal(altDecorator.calendarYearMonth(), '201401');
    });

    it("calendarYearWeek builds a string with the full year and week", function() {
      assert.equal(decorator.calendarYearWeek(), '201450');
      assert.equal(altDecorator.calendarYearWeek(), '201404');
    });

    it("calendarYearQuarter builds a string with full year and quarter", function() {
      assert.equal(decorator.calendarYearQuarter(), '20144');
      assert.equal(altDecorator.calendarYearQuarter(), '20141');
    });

    it("fiscalYearQuarter builds a string with the fiscal year and the quarter", function() {
      assert.equal(decorator.fiscalYearQuarter(), '20151');
      assert.equal(altDecorator.fiscalYearQuarter(), '20142');
    });
  });
});
