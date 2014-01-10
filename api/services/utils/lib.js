// used to generate an actionID shared by all notifications triggered from the same stimuli
// function createGUID() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
//         return v.toString(16);
//     });
// }

function deepExtend(){
	var _source;
	var args = Array.prototype.slice.call(arguments);
	if(args.length > 1){
		_source = args.pop();
		_deepExtend(args[args.length - 1], _source);
		deepExtend.apply(this, args);
	}
	return args[0];

	// iterative variant
	// var returnMe = arguments[arguments.length - 1];
	// for( var i = arguments.length - 1; i > 0; i++)
	// {
	// 	returnMe = _deepExtend(arguments[i-1], returnMe);
	// }
	// return returnMe;

	function _deepExtend(target, source) {
		if(source){
			for (var prop in source){
				target = target || {};
				if (typeof target[prop] == 'object' && prop in target && source[prop]) {
					_deepExtend(target[prop], source[prop]);
				}
				else if(source[prop]){
					target[prop] = source[prop];
				}
				// won't override target if source property is NULL
			}
		}
	  return target;
	}
}

function singleton(callerFuncName, makerFunc, makerArgs){
		var _instance;
		var _returnMe;
		var makeInstance = function(){
			var inst = makerFunc.apply(this, makerArgs);
			return inst;
		};
		var getInstance = function(){
			if(!_instance){
				_instance = makeInstance();
			}
			return _instance;
		};
		_returnMe = {};
		_returnMe[callerFuncName] = getInstance;
		return _returnMe;
}
// validate local fields against global field definitions
function validateFields(fields, globalFieldCollection, done){
	_.each(fields, validateField);
	_.each(globalFieldCollection, validateGlobals);
	done(null, fields);
	// sets local field to default value if one exists
	function validateGlobals(fieldObject, key, list){
		if(fieldObject.required && !(fieldObject.name in fields) && typeof fieldObject.defaultValue === "undefined"){
			//todo: more relevant data here
			throw new Error('validation failed');
		}
		if(!(fieldObject.name in fields) && !(typeof fieldObject.defaultValue === "undefined")  ){
			fields[fieldObject.name] = fieldObject.defaultValue;
		}
	}
	// ensure that each field passed is valid
	function validateField(value, field, list){
		var validator;
		validator = sails.services.utils['validation'];
		if(typeof globalFieldCollection[field].validation !== "undefined" && globalFieldCollection[field].validation)
		{
			// NOTE: All validator functions are performed without callbacks. Must not contain I/O
			if(!validator[globalFieldCollection[field].validation](field, value, fields)){
				//todo: more relevant data here
				throw new Error('validation failed');
			}
		}
	}
}

module.exports = {
	singleton: singleton,
	deepExtend: deepExtend,
	validateFields: validateFields
};
