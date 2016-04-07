var assert = require('chai').assert;
var request = require('supertest');

describe('TaskController', function() {

  describe('api/task', function() {
    var isZeroTasksResult = function(res) {
      assert.deepEqual(res.body,
        {
          tasks: []
        }
      )
    }

    it('with zero tasks, returns empty array', function (done) {
      request(sails.hooks.http.app)
        .get('/api/task')
        .expect(200)
        .expect(isZeroTasksResult)
        .end(done)
    });
  });
});
