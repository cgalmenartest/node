var assert = require('chai').assert;

describe('UserModel', function() {
  var userAttrs = {
    'name': 'Maria Sanchez',
    'username': 'maria@openopps.org',
    'password': 'TestTest123#'
  };

  describe('#create', function() {
    describe('new user', function() {
      var newUser = {};
      before(function(done) {
        User.create(userAttrs)
        .then(function(result) {
            newUser = result;
            done();
        })
        .catch(done);
      });
      it('should have username', function (done) {
          assert.equal(newUser.username, userAttrs.username);
          done();
      });
      it('should have name', function (done) {
          assert.equal(newUser.name, userAttrs.name);
          done();
      });
      it('should not have password', function (done) {
          assert.notProperty(newUser, 'password');
          done();
      });

    });
  });

});
