var _ = require('underscore');

module.exports = {
  annotateTimeRequired: function(data, userAgency) {
    console.log('annotateTimeRequired in', data);
    data = _.chain(data).filter(function (item) {
      // if an agency is included in the data of a tag
      // then restrict it to users who are also
      // in that agency
      var agencyId = false;
      if (item.data && item.data.agency) agencyId = item.data.agency.id;
      if ((!agencyId) || (userAgency && agencyId === userAgency.id)) return true;
      return false;
    }).map(function (item) {
      if (item.value == 'One time') {
        item.description = 'A one time task with a defined timeline';
        item.alwaysRestrictAgency = false;
      }
      else if (item.value == 'Ongoing') {
        item.description = 'Requires a portion of participant’s time until a goal is reached';
        item.alwaysRestrictAgency = false;
      }
      else if (item.value == 'Full Time Detail') {
        item.alwaysRestrictAgency = true;
      }
      return item;
    }).value();
    console.log('annotateTimeRequired out', data);

    return data;
  },
  /*
   * return the unique identifier (agency.abbr) which we'll save on the
   * server if the restrict agency checkbox is checked
   */
  getRestrictAgencyValue: function(view) {
    var restrictAgencyChecked = view.$( '#task-restrict-agency' ).val();
    var tmp = restrictAgencyChecked ? view.agency.abbr : '';
    console.log(tmp, typeof(tmp));
    return restrictAgencyChecked ? view.agency.abbr : '';
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

    // hide everything by default
    timeRequired.hide();
    timeRequiredAside.hide();
    timeFrequency.hide();
    completionDate.hide();

    timeRequiredTag = _.findWhere(view.tagSources['task-time-required'], {id: parseInt(currentValue)});
    if (timeRequiredTag) {
      if (view.agency.allowRestrictAgency) {
        restrictAgency.prop('disabled', timeRequiredTag.alwaysRestrictAgency);
        restrictAgency.prop('checked', (timeRequiredTag.value === 'Full Time Detail'));
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
