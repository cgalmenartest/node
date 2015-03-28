
var _ = require('underscore');
var Backbone = require('backbone');
var utilities = require('../../../../mixins/utilities');
var Autolinker = require('autolinker');
var marked = require('marked');
var CommentItemTemplate = require('../templates/comment_item_template.html');


var CommentItemView = Backbone.View.extend({

  render: function () {
    this.model.currentUser = window.cache.currentUser;
    this.model.valueHtml = marked(Autolinker.link(this.model.value));
    this.model.commentId = this.model.id;
    if (this.model.topic) {
      this.model.isTopic   = true;
      var compiledTemplate = _.template(CommentItemTemplate)(this.model);
      this.$el.append(compiledTemplate);
    } else {
      var self = this;
      this.model.isTopic   =  false;
      if (this.model.parentId === parseInt($("#comment-list-" + this.model.parentId).attr("id").split("-")[$("#comment-list-"+this.model.parentId).attr("id").split("-").length - 1])) {
        var newTemplate = _.template(CommentItemTemplate)(this.model);
        $("#comment-list-" + this.model.parentId).append(newTemplate);
      }
    }
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = CommentItemView;
