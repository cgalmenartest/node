/**
 * This component implements a Markdown TextEditor that can be
 * dropped into anywhere on an existing form.
 * Initialize the MarkdownEditor with an element `el`,
 * and the `id` of the textarea (so you can retreive its
 * value when the user submits the form.)
 *
 * Options:
 *   el: HTML element to fill - required
 *   id: HTML ID for the <textarea> element - required
 *   data: Default data for the textarea - required
 *   maxlength: Maximum characters for the text area - optional
 *   rows: Number of rows in the textarea - optional
 *   validation: List of strings for the data-validate attribute - optional
 *     example: ['empty', 'count400']
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'marked',
  'base_component',
  'jquery.selection',
  'text!markdown_editor_template'
], function ($, _, Backbone, utils, marked, BaseComponent, jqSelection, EditorTemplate) {

  Application.Component.MarkdownEditor = BaseComponent.extend({

    events: {
      "click .btn"                 : "clickButton"
    },

    initialize: function (options) {
      this.options = options;
      this.actions = {
        'bold': {
          before: '**',
          text: 'text',
          after: '**'
        },
        'italic': {
          before: '_',
          text: 'text',
          after: '_'
        },
        'strikethrough': {
          before: '~~',
          text: 'text',
          after: '~~'
        },
        'code': {
          before: '`',
          text: 'code',
          after: '`'
        },
        'link': {
          before: '[Link Title](',
          text: 'http://',
          after: ')'
        }
      }
      return this;
    },

    render: function () {
      var data = {
        id: this.options.id,
        validation: this.options.validation,
        rows: this.options.rows,
        maxlength: this.options.maxlength,
        data: this.options.data
      };
      var template = _.template(EditorTemplate, data);
      this.$el.html(template);
      return this;
    },

    clickButton: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();
      var t = $(e.currentTarget);
      var selText = this.$("#" + this.options.id).selection();
      var editData = t.data('edit');
      // check if it already has the attributes
      if ((editData != 'preview') &&
          (editData != 'edit') &&
          (editData != 'help')) {
        if (selText == '') {
          selText = this.actions[editData].text;
        }
        this.$("#" + this.options.id).selection('insert', {
          text: this.actions[editData].before,
          mode: 'before'
        })
        .selection('replace', {
          text: selText
        })
        .selection('insert', {
          text: this.actions[editData].after,
          mode: 'after'
        });
      } else if (editData == 'help') {
        if (this.$('.help').is(':visible')) {
          this.$('.help').hide();
          t.removeClass('active');
        } else {
          this.$('.help').show();
          t.addClass('active');
        }
      } else {
        // if we're in preview mode, switch back to edit mode
        if (this.$('.preview').is(':visible')) {
          this.$('.btn-edit').hide();
          this.$('.btn-preview').show();
          this.$('.preview').hide();
          this.$("#" + this.options.id).show();
        } else {
          // render the preview using marked
          var html = marked(this.$("#" + this.options.id).val());
          this.$('.btn-preview').hide();
          this.$('.btn-edit').show();
          this.$('.preview').html(html);
          this.$("#" + this.options.id).hide();
          this.$('.preview').show();
        }
      }
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return Application.Component.MarkdownEditor;
});
