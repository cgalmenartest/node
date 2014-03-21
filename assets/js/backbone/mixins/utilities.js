// Input:
// @collection [ARRAY] Backbone collection.
// @modelId [INTEGER] Backbone Model.cid

// Return: [OBJECT] Model instance looked up from modelId within collection.
var getCurrentModelFromId = function (collection, modelId) {
	var i = 0;
			id = parseInt(modelId)
			models = collection.models;

	for ( ; i < models.length; i += 1) {
		if (models[i].id === id) {
			return models[i];
		} else {
			continue;
		}
	}
}

// Input:
// @collection [ARRAY] Backbone collection.
// @attr [STRING] Value, to be found.

// Return: [OBJECT] Model instance that is corollary to the found @attr value.
var getCurrentModelFromFormAttributes = function (collection, attr) {
	var	j,
			i = 0,
			attr = $.trim(attr),
			models = collection.models;

	// Loop through all the models
	for ( ; i < models.length; i += 1) {

		// Loop through all the attributes within the model
		for (j in models[i].attributes) {

			// If we find the model.attr[value] on the current models
			// attribute that we are looping over, then stop and return that
			// model back out to the front-end.
			if (models[i].attributes[j] === attr) {
				return models[i]
			} else {
				// Otherwise continue on.
				continue;
			}
		}
	}
}

/**
 * Input:
 * @model [OBJECT* instance] Model instance.
 * @field [OBJECT property] Field you want to focus on for unmarshaling.
 * @splitType [STRING] Split type for marshalling (Eg: ||, -, etc)
 *
 * Return: Nothing; Cleaned @field [OBJECT property] stored in model.value
 */
var cleanStringFromUndefined = function (model, field, splitType) {
  var data, compiledTemplate,
      valueArray              = field.split(splitType),
      lastStringInValueArray  = $.trim(valueArray[valueArray.length - 1]);

  if (lastStringInValueArray === 'undefined') {
    valueArray.pop(lastStringInValueArray)
    model.value = valueArray.join()
  }
}

/**
 * Completely remove a backbone view and all of its
 * references.  This is needed to destroy the view
 * and all of its listeners, in order to start
 * fresh again and render a new view with a new
 * model.
 *
 * Input:
 * @view the view to be removed, typically called with removeView(this);
 *
 * Return:
 * nothing
 */
var removeView = function (view) {
  view.undelegateEvents();
  view.$el.html("");
}

/**
 * Clear out any el.
 * @params {[The non-jquery mapped el for the view instance]}
 * Return: Nothing.
 */
var clearEl = function (el) {
  $(el).children().remove();
}

/**
 * Clear out our global container for full page transitions.
 * @params None
 * @return Nothing
 */
var clearContainer = function () {
  $("#container").children().remove();
}

/**
 * This helps alleviate a common bug with ajax based
 * page transitions. That is sometimes when the page pushes itself off the screen
 * and allows a browser default background to show, after which scrolling
 * up is required.  It is a somewhat rare bug, but useful to have this function
 * if you need it.
 *
 * Return:
 * nothing
 */
var scrollTop = function () {
  $(window).scrollTop($(window).scrollTop());
}

/**
 * Add a method to the global Function object called "addSpinner",
 * which allows us to call the chained method "addSpinner" from any function
 * within the application.  Especially useful with render methods.
 * @param  {[Backbone View Instance]} self
 *
 * Return:
 * Attaches the spinner to the $el of the backbone view instance passed in, before that
 * view can actually set its $el, thereby dynamically allowing a spinner to exist with little effort.
 */
var addSpinnerToFunctionPrototype = function (self) {
  if (self) {
    Function.prototype.addSpinner = function () {
      self.$el.append("<i class='icon-spin icon-spinner'></i>")
    }
  } else {
    throw new Error("Pass in a Backbone View class");
  }
}

/**
 * Organize the tags output into an associative array key'd by their type.
 * If the tag has more than one value for said key, make it an array otherwise
 * keep it as a top level object.
 * @param  {[array]} tags           [array of tags]
 * @return {[object]}               [bindingObject returned out]
 */
var organizeTags = function (tags) {
  var outTags = {};
  for (t in tags) {
    if (!(_.has(outTags, tags[t].tag.type))) {
      outTags[tags[t].tag.type] = [];
    }
    outTags[tags[t].tag.type].push(tags[t].tag);
  }
  return outTags;
}

/**
 * Validate an input field.  Assumes that there is a data
 * variable in the HTML tag called `data-validate` with the
 * validation options that you want to enforce.
 *
 * The input should be in a `form-group` component,
 * and the component should have a .help-text element
 * with a class `.error-[code]` where [code] is the
 * validation rule (eg, `empty`);
 *
 * Expects an object with currentTarget, eg { currentTarget: '#foo' }
 */
var validate = function (e) {
  var opts = String($(e.currentTarget).data('validate')).split(',');
  var val = $(e.currentTarget).val();
  var parent = $(e.currentTarget).parents('.form-group, .checkbox')[0];
  var result = false;
  _.each(opts, function (o) {
    if (o == 'empty') {
      if (!val) {
        $(parent).find('.error-empty').show();
        result = true;
      } else {
        $(parent).find('.error-empty').hide();
      }
      return;
    }
    if (o == 'checked') {
      if ($(e.currentTarget).prop('checked') !== true) {
        $(parent).find('.error-checked').show();
        result = true;
      } else {
        $(parent).find('.error-checked').hide();
      }
      return;
    }
    if (o.substring(0,5) == 'count') {
      var len = parseInt(o.substring(5));
      if (val.length > len) {
        $(parent).find('.error-' + o).show();
        result = true;
      } else {
        $(parent).find('.error-' + o).hide();
      }
      return;
    }
    if (o == 'confirm') {
      var id = $(e.currentTarget).attr('id');
      var newVal = $('#' + id + '-confirm').val();
      if (val != newVal) {
        $(parent).find('.error-' + o).show();
        result = true;
      } else {
        $(parent).find('.error-' + o).hide();
      }
      return;
    }
    if (o == 'button') {
      if (!($($(parent).find("#" + $(e.currentTarget).attr('id') + "-button")[0]).hasClass('btn-success'))) {
        $(parent).find('.error-' + o).show();
        result = true;
      } else {
        $(parent).find('.error-' + o).hide();
      }
    }
  });
  if (result === true) {
    $(parent).addClass('has-error');
  } else {
    $(parent).removeClass('has-error');
  }
  return result;
};

var validatePassword = function (username, password) {
  var rules = {
    username: false,
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false
  };
  var _username = username.toLowerCase().trim();
  var _password = password.toLowerCase().trim();
  // check username is not the same as the password, in any case
  if (_username != _password && _username.split('@',1)[0] != _password) {
    rules['username'] = true;
  }
  // length > 8 characters
  if (password && password.length >= 8) {
    rules['length'] = true;
  }
  // Uppercase, Lowercase, and Numbers
  for (var i = 0; i < password.length; i++) {
    var test = password.charAt(i);
    // from http://stackoverflow.com/questions/3816905/checking-if-a-string-starts-with-a-lowercase-letter
    if (test === test.toLowerCase() && test !== test.toUpperCase()) {
      // lowercase found
      rules['lower'] = true;
    }
    else if (test === test.toUpperCase() && test !== test.toLowerCase()) {
      rules['upper'] = true;
    }
    // from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
    else if (!isNaN(parseFloat(test)) && isFinite(test)) {
      rules['number'] = true;
    }
  }
  // check for symbols
  if (/.*[^\w\s].*/.test(password)) {
    rules['symbol'] = true;
  }
  return rules;
};
