define([
  'underscore',
  'backbone',
  'text!comment_item_template'
], function (_, Backbone, CommentItemTemplate) {

  var CommentItemView = Backbone.View.extend({

    render: function () {
      // TEMP: Check if there is no link coming back to unmarshal
      // This cleans up the front-end presentation until we fully implement
      // marshalling and un-marshalling.
      var data, compiledTemplate,
          valueArray              = this.model.value.split("||"),
          lastStringInValueArray  = $.trim(valueArray[valueArray.length - 1]);

      if (lastStringInValueArray === 'undefined') {
        valueArray.pop(lastStringInValueArray)
        this.model['value'] = valueArray.join()
      }

      data = { comment: this.model };

      compiledTemplate = _.template(CommentItemTemplate, data);
      this.$el.append(compiledTemplate);
    },

    cleanup: function () {
      $(this.el).children().remove();
    }

  });

  return CommentItemView;
})