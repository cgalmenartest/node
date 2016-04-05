var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-datetime'));

describe('UserModel', function() {
  var createAttrs = {
    'name': 'Maria Sanchez',
    'username': 'MARIA@openopps.org',
    'password': 'TestTest123#',
    'bio': 'JavaScript expert with an interest in public policy.'
  };
  var expectedAttrs = {
    'id': 1,
    'name': 'Maria Sanchez',
    'username': 'maria@openopps.org',
    'bio': 'JavaScript expert with an interest in public policy.'
    // also expect createdAt and updatedAt
  };

  describe('new user', function() {
    var newUser = {};
    before(function(done) {
      User.create(createAttrs)
      .then(function(result) {
          newUser = result;
          done();
      })
      .catch(done);
    });
    describe('#create', function() {
      it('should have username', function (done) {
          assert.equal(newUser.username, expectedAttrs.username);
          done();
      });
      it('should have name', function (done) {
          assert.equal(newUser.name, expectedAttrs.name);
          done();
      });
      it('should not have password', function (done) {
          // this is really testing that random attributes are not saved
          assert.notProperty(newUser, 'password');
          done();
      });
      it('should have zero passports', function (done) {
          assert.equal(newUser.passports.length, 0);
          done();
      });
    });
    describe('#toJSON', function() {
      it('has created date', function (done) {
        assert.instanceOf(newUser.createdAt, Date);
        done();
      });
      it('has updated same as created', function (done) {
        assert.equalDate(newUser.updatedAt, newUser.createdAt);
        done();
      });
      it('has expected properties', function (done) {
          newUserAttrs = newUser.toJSON()
          delete newUserAttrs.createdAt // tested above
          delete newUserAttrs.updatedAt // tested above
          assert.deepEqual(newUserAttrs, expectedAttrs);
          done();
      });
    });
  });

  describe('errors:', function() {
    var newUser = {};
    before(function(done) {
      User.create(createAttrs)
      .then(function(result) {
          newUser = result;
          //done();

          User.find({username: createAttrs.username}, function(err, records) {
            assert(!err);
            assert.equal(records.length, 1);
            done();
          });
      })
      .catch(done);
    });
    //WLValidationError
    describe('#create', function() {
      it('should fail with duplicate username (email)', function (done) {
        User.create({username: createAttrs.username}, function(err, records) {
          //assert.isNotNull(err, 'expect an error from User.create');
          //assert.equal(err.code, 'E_VALIDATION');
          User.find({username: createAttrs.username}, function(err, records) {
            assert(!err);
            assert.equal(records.length, 1);
            done();
          });
        });
      });
    });
  });
});
