// This is a BaseView that we will be using to extend our new view methods.
// The methods herein are mainly interfaces for new views.
// 
// var newViewName = BaseView.extend({
// 
// 	template: "#new-template",
// 
// 	serialize: function () {
// 		data: this.model.toJSON()
// 	},
// 
//  addSubView: function () {
// 		newView(require[viewName], toInit);
// 	}
// 
//  This automatically will add the view data to the template.
//  And will create the subviews in a reusable and clean fashion.
// })

var BaseView = Backbone.View.Extend({

	template: _.template(""),

	serialize: function () {
		return {};
	},

	render: function () {
		var markup = this.template(this.serialize);
		this.$el.html(markup);
		return this;
	},

	newView: function (viewName, toInit) {
		if (toInit) {
			if (this.viewName) {
				this.viewName.initialize();
			} else {
				new viewName();
			}
		}
	},

	newModel: function (modelName, toDestroy) {
		if (toDestroy === true) {
			if (this.modelName) {
				this.modelName.destroy();
			} else {
				new modelName();
			}
		}
	},

	newCollection: function (collectionName, toFetch) {
		if (toFetch === true) {
			if (this.collectionName) {
				this.collectionName.fetch();
			} else {
				this.collection = new collectionName();
				this.collection.fetch();
			}
		}
	}

});