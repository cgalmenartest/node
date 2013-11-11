define([
  'jquery',
  'jquery_select2',
  'underscore',
  'backbone',
  'utilities',
  'tag_config',
  'text!project_list_template',
  'text!project_search_tag'
], function ($, select2, _, Backbone, utils, TagConfig, ProjectListTemplate, ProjectSearchTag) {

  var ProjectsCollectionView = Backbone.View.extend({

    events: {
      "submit #search-form"       : "search",
      "click .search-tag-remove"  : "searchTagRemove",
      "click .search-clear"       : "searchClear"
    },

    render: function () {
      var projectsJSON = {
        projects: this.options.collection.toJSON(),
        user: window.cache.currentUser
      }

      this.compiledTemplate = _.template(ProjectListTemplate, projectsJSON)
      this.$el.html(this.compiledTemplate);

      this.initializeSearch();

      // Allow chaining.
      return this;
    },

    format: function (self, object, container, query) {
      var name = object.name || object.title;
      var icon = this.tagIcon[object.type];
      if (object.title) {
        icon = 'icon-folder-close-alt';
      }
      return '<i class="' + icon + '"></i> <span class="box-icon-text">' + name + '</span>';
    },

    initializeSearch: function() {
      var self = this;
      this.searchTerms = [];
      this.tags = _.values(TagConfig.tags);
      this.tagIcon = {};
      this.tagClass = {};

      for (var i = 0; i < this.tags.length; i++) {
        this.tagIcon[this.tags[i].type] = this.tags[i].icon;
        this.tagClass[this.tags[i].type] = this.tags[i]['class'];
      }

      var formatResult = function (object, container, query) {
        return self.format(self, object, container, query);
      };

      // Initialize Select2
      $("#search").select2({
        placeholder: 'I\'m looking for...',
        multiple: true,
        formatResult: formatResult,
        formatSelection: formatResult,
        ajax: {
          url: '/api/ac/search',
          dataType: 'json',
          data: function (term) {
            return {
              q: term
            };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });
    },

    search: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();
      // get values from select2
      var data = $("#search").select2("data");
      if (data.length > 0) {
        $("#search-none").hide();
        $(".search-clear").show();
      }
      _.each(data, function (d) {
        var found = false;
        // check if this search term already is chosen
        for (var i in self.searchTerms) {
          if (self.searchTerms[i].id == d.id) {
            if (self.searchTerms[i].title && (self.searchTerms[i].title == d.title)) {
              found = true;
            }
            else if (self.searchTerms[i].name && (self.searchTerms[i].name == d.name)) {
              found = true;
            }
          }
        }
        // return if the search term is found
        if (found) return;
        // add it to our list of search terms
        self.searchTerms.push(d);
        // render the search term in the list
        var templData = {
          data: d,
          format: self.format(self, d)
        };
        var templ = _.template(ProjectSearchTag, templData);
        if (d.title) {
          $("#search-projs").append(templ);
        } else {
          $("#search-tags").append(templ);
        }
      });
      $("#search").select2("data","");
    },

    searchTagRemove: function (e) {
      if (e.preventDefault) e.preventDefault();

      var self = this;
      var parent = $(e.currentTarget).parents('li')[0];
      var id = $(parent).data('id');
      var type = $($(e.currentTarget).parents('ul')[0]).attr('id');
      var project = false;

      if (type == 'search-projs') {
        project = true;
      }

      for (i in self.searchTerms) {
        if (self.searchTerms[i].id == id) {
          if (project && self.searchTerms[i].title) {
            self.searchTerms.splice(i, 1);
            break;
          } else if (self.searchTerms[i].name) {
            self.searchTerms.splice(i, 1);
            break;
          }
        }
      }
      parent.remove();
      if (self.searchTerms.length == 0) {
        $("#search-none").show();
        $(".search-clear").hide();
      }
    },

    searchClear: function (e) {
      if (e.preventDefault) e.preventDefault();
      this.searchTerms = [];
      $("#search-projs").children().remove();
      $("#search-tags").children().remove();
      $("#search-none").show();
      $(".search-clear").hide();
    },

    cleanup: function() {
      removeView(this);
    }

  });

  return ProjectsCollectionView;
});