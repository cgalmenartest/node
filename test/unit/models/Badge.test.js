var assert = require('chai').assert;
var conf = require('../../api/sails/helpers/config');

describe('BadgeModel', function() {
  var user;
  var task;

  describe('#awardForTaskCompletion()', function() {
    before(function(done) {
      task = {id:1}
      User.create(conf.defaultUser).exec(function createCB(err, new_user){
        user = new_user;
        console.log('Created user', user);
        done(err);
      });
    });

    describe('no tasks', function() {
      it('should not award a badge', function (done) {
        Badge.awardForTaskCompletion(task, user, function(err, badges) {
          console.log('badges awarded', badges)
          assert.equal(badges.length, 0, 'badge should not be created');
          done();
        });
      });
    });

    describe('1 task', function() {
      it('should award a badge', function (done) {
        user.completedTasks = 1;
        user.save(function(err, user) {
          if (err) done(err);
          Badge.awardForTaskCompletion(task, user, function(err, badges) {
            console.log('badges awarded', badges)
            assert.equal(badges.length, 1, 'badge should be created');
            done();
          });
        });
      });
    });
  });
});
