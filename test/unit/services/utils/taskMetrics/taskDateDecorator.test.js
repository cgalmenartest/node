var async = require('async');
var assert = require('chai').assert;
var _ = require('underscore');

var conf = require('../../../../api/sails/helpers/config');

TaskDecorator = require('../../../../../api/services/utils/taskMetrics/taskDecorator');

describe('TaskDecorator', function() {
  var original, decoratedTask, decorator;
  function setupDecoration() {
    decorator = new TaskDecorator(original);
    decoratedTask = decorator.decorate();
  }

  it('does not mutate the original', function() {
    original = {foo: 'bar', state: 'assigned', createdAt: '3/3/2012'};
    setupDecoration();

    assert.deepEqual(original, {foo: 'bar', state: 'assigned', createdAt: '3/3/2012'});
  });

  describe('when all dates are present', function() {
    it('does not overwrite them', function() {
      original = {createdAt: '1/1/2012', publishedAt: '2/2/2012', assignedAt: '3/3/2012', completedAt: '4/1/2012', state: 'completed'};
      setupDecoration();

      assert.equal(decoratedTask.publishedAt, original.publishedAt);
      assert.equal(decoratedTask.assignedAt, original.assignedAt);
      assert.equal(decoratedTask.completedAt, original.completedAt);
    });
  });

  describe('when publishedAt is missing', function() {
    it('when state is open, sets publishedAt and isPublished', function() {
      original = {createdAt: '1/1/2012', state: 'open'};
      setupDecoration();

      assert.equal(decoratedTask.isPublished, true);
      assert.equal(decoratedTask.publishedAt, '1/1/2012');
    });

    it('when state is assigned, sets publishedAt and isPublished', function() {
      original = {createdAt: '1/1/2012', state: 'assigned'};
      setupDecoration();

      assert.equal(decoratedTask.isPublished, true);
      assert.equal(decoratedTask.publishedAt, '1/1/2012');
    });

    it('when state is completed, sets publishedAt to createdAt', function() {
      original = {createdAt: '1/1/2012', state: 'completed'};
      setupDecoration();

      assert.equal(decoratedTask.isPublished, true);
      assert.equal(decoratedTask.publishedAt, '1/1/2012');
    });
  });

  describe('when assignedAt is missing', function() {
    it('when state is assigned, sets assignedAt and isAssigned', function() {
      original = {createdAt: '1/1/2012', state: 'assigned'};
      setupDecoration();

      assert.equal(decoratedTask.isAssigned, true);
      assert.equal(decoratedTask.assignedAt, '1/1/2012');
    });

    it('when state is complete, sets assignedAt and isAssigned', function() {
      original = {createdAt: '1/1/2012', state: 'completed'};
      setupDecoration();

      assert.equal(decoratedTask.isAssigned, true);
      assert.equal(decoratedTask.assignedAt, '1/1/2012');
    });
  });

  describe('when completedAt is missing, but state is completed', function() {
    it('sets assignedAt to completedAt when state is completed and empty', function() {
      original = {createdAt: '1/1/2012', state: 'completed'};
      setupDecoration();

      assert.equal(decoratedTask.isCompleted, true);
      assert.equal(decoratedTask.completedAt, '1/1/2012');
    });
  });

  describe('isNotArchived', function() {
    it('should be false when the task has been archived', function() {
      original = {createdAt: '1/1/2012', state: 'archived'};
      setupDecoration();

      assert.equal(decoratedTask.isNotArchived, false)
    });

    it('should otherwise be true', function() {
      original = {createdAt: '1/1/2012', state: 'completed'};
      setupDecoration();

      assert.equal(decoratedTask.isNotArchived, true)
    });
  });

  describe("date code generations", function() {
    beforeEach(function() {
      original = {createdAt: '11/1/2015', state: 'completed'}
    });

    function decorateWithGroup(group) {
      decorator = new TaskDecorator(original);
      decoratedTask = decorator.decorate(group);
    }

    it("adds attributes for each of the date codes", function() {
      decorateWithGroup();
      assert.ok(decoratedTask.createdAtCode);
      assert.ok(decoratedTask.assignedAtCode);
      assert.ok(decoratedTask.publishedAtCode);
      assert.ok(decoratedTask.completedAtCode);
    });

    it("uses the DateCodeGenerator to decorate createdAtCode correctly", function() {
      decorateWithGroup();
      assert.equal(decoratedTask.createdAtCode, "2016");

      decorateWithGroup("year");
      assert.equal(decoratedTask.createdAtCode, "2015");

      decorateWithGroup("month");
      assert.equal(decoratedTask.createdAtCode, "201511");

      decorateWithGroup("quarter");
      assert.equal(decoratedTask.createdAtCode, "20154");

      decorateWithGroup("fyquarter");
      assert.equal(decoratedTask.createdAtCode, "20161");
    });
  });
});

