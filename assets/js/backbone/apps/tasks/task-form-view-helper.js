var _ = require('underscore');

module.exports = {
  annotateTimeRequired: function(data, userAgency) {
    return _(data).map(function (item) {
      if (item.value == 'One time') {
        item.description = 'A one time task with a defined timeline';
        item.alwaysRestrictAgency = false;
      }
      else if (item.value == 'Ongoing') {
        item.description = 'Requires a portion of participant’s time until a goal is reached';
        item.alwaysRestrictAgency = false;
      }
      else if (item.value == 'Full Time Detail') {
        item.description = 'Restricted to requester\'s agency';
        item.alwaysRestrictAgency = true;
      }
      return item;
    });
  },
  /*
   * return the unique identifier (agency.abbr) which we'll save on the
   * server if the restrict agency checkbox is checked
   */
  getRestrictAgencyValue: function ( view ) {
    var restrictAgencyChecked = view.$(  '#task-restrict-agency'  ).prop( 'checked' );
    if ( restrictAgencyChecked ) {
      view.model.attributes.restrict.projectNetwork = true;
    } else {
      view.model.attributes.restrict.projectNetwork = false;
    }
    return view.model.attributes.restrict;
  },

  /*
   * Setup Time Options toggling
   */
  toggleTimeOptions: function (view) {
    var currentValue     = view.$('[name=task-time-required]:checked').val(),
        timeRequired       = view.$('#time-options-time-required'),
        timeRequiredAside  = view.$('#time-options-time-required aside'),
        completionDate     = view.$('#time-options-completion-date'),
        timeFrequency      = view.$('#time-options-time-frequency'),
        restrictAgency     = view.$('#task-restrict-agency'),
        timeRequiredTag;

    // restrict is a String with agency abbr or empty string for not restricted
    var isRestricted = view.model.get( 'restrict' ).projectNetwork;
    var isFullTimeDetail = timeRequiredTag.value === 'Full Time Detail';

    // hide everything by default
    timeRequired.hide();
    timeRequiredAside.hide();
    timeFrequency.hide();
    completionDate.hide();

    timeRequiredTag = _.findWhere(view.tagSources['task-time-required'], {id: parseInt(currentValue)});
    if (timeRequiredTag) {
      if (isFullTimeDetail || isRestricted) {
        restrictAgency.prop('disabled', timeRequiredTag.alwaysRestrictAgency);
        restrictAgency.prop('checked', isFullTimeDetail || isRestricted);
      }

      if (timeRequiredTag.value === 'One time') {
        timeRequired.show();
        completionDate.show();
        timeRequiredAside.hide();
        timeFrequency.hide();
      }
      else if (timeRequiredTag.value === 'Ongoing') {
        timeRequired.show();
        timeRequiredAside.show();
        timeFrequency.show();
        completionDate.hide();
      }
    }

  },

};
