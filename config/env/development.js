console.log('Loading... ', __filename);

// Override settings for development
// ****NOTE**** Midas uses npm run migrate to initiate db changes
//    4/8/2015 --  migrate alter doesn't appear to work correctly with the softdelete sails postgres fork midas uses
//         ( it undeletes things that have been soft deleted on sails lift )

module.exports.models = {
  migrate: 'safe'
};
