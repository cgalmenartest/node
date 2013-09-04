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

var getCurrentProjectModelFromFormAttributes = function (collection, attr) {
	var	j,
			i = 0,
			attr = $.trim(attr),
			models = collection.models;

			// Loop through all the models
			for ( ; i < models.length; i += 1) {

				// Loop through all the attributes within the model
				for (var j in models[i].attributes) {

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