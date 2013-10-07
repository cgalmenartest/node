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

// Input:
// @model [OBJECT* instance] Model instance.
// @field [OBJECT property] Field you want to focus on for unmarshaling.
// @splitType [STRING] Split type for marshalling (Eg: ||, -, etc)

// Return: Cleaned @field [OBJECT property].
var cleanStringFromUndefined = function (model, field, splitType) {
  var data, compiledTemplate,
      valueArray              = field.split(splitType),
      lastStringInValueArray  = $.trim(valueArray[valueArray.length - 1]);

  if (lastStringInValueArray === 'undefined') {
    valueArray.pop(lastStringInValueArray)
    model.value = valueArray.join()
  }
}