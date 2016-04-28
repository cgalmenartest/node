var _ = require('lodash');
var fs = require('fs');
var parse = require('csv-parse/lib/sync');

module.exports = {
  importFromFile: function(model, filepath) {
    console.log("importing:", filepath);
    if (fs.existsSync(filepath)) {
      input = fs.readFileSync(filepath);
      var attrList = parse(input, {columns: true});
      var date = new Date();
      return model.create(attrList);
    } else {
      var msg = "File Not Found: '" + filepath + "'"
      console.log(msg)
      throw new Error(msg);
    }
  },
  importTasksFromFile: function(filepath) {
    console.log("importing:", filepath);
    if (fs.existsSync(filepath)) {
      input = fs.readFileSync(filepath);
      var attrList = parse(input, {columns: true});
      var date = new Date();
      return Task.create(attrList);
    } else {
      var msg = "File Not Found: '" + filepath + "'"
      console.log(msg)
      throw new Error(msg);
    }
  }
}
