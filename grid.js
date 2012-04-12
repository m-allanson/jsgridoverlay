// micro templating from underscore
var _ = {};

//     Underscore.js 1.3.1
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + unescape(code) + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + unescape(code) + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

// Extend a given object with all the properties in passed-in object(s)
// based on the underscore.js extend()/each(), only uses native foreach
_.extend = function(obj) {
	// make an array of objects that need to be merged
	var sources = Array.prototype.slice.call(arguments, 1);

	// add keys from each source object to our passed in object
	sources.forEach(function(source){		
		for (var key in source) {
			if (source.hasOwnProperty(key)) {
				obj[key] = source[key];
			}
		}
	});

    return obj;
};


// a little inArray implementation.
// maybe from jqyuery? check this... 
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}


// a lovely almost standalone implementation of backbone's extend.
// from https://github.com/jimmydo/js-toolbox/blob/master/toolbox.js
// Uses underscore's extend method, which I have my own implementation of above.
(function () {
    "use strict";

    var Toolbox = window.Toolbox = {};

    // `ctor` and `inherits` are from Backbone (with some modifications):
    // http://documentcloud.github.com/backbone/

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function () {};

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var inherits = function (parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call `super()`.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () { return parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    // Self-propagating extend function.
    // Create a new class that inherits from the class found in the `this` context object.
    // This function is meant to be called in the context of a constructor function.
    function extendThis(protoProps, staticProps) {
        var child = inherits(this, protoProps, staticProps);
        child.extend = extendThis;
        return child;
    }

    // A primitive base class for creating subclasses.
    // All subclasses will have the `extend` function.
    // Example:
    //     var MyClass = Toolbox.Base.extend({
    //         someProp: 'My property value',
    //         someMethod: function () { ... }
    //     });
    //     var instance = new MyClass();
    Toolbox.Base = function () {};
    Toolbox.Base.extend = extendThis;
})();








var Model, Controller, View;

// Model.  
// Stores a representation of the attributes
// Persists attributes to localStorage
// Metadata just stored for current session
/**
 * @constructor
 */
var Model = Toolbox.Base.extend({

	// get defaults
	// overwrite with anything passed in
	// overwrite with previously saved data
	constructor: function (attributes, options) {
		console.log('Model');

		options || (options = {});
		this._options = _.extend(this._options, options);

		// merge passed in attributes into default attributes
		attributes || (attributes = {});
		attributes = _.extend(this.attributes, attributes);

		this._load(); // load in any previously saved attributes (from localStorage)
		this.set(attributes); // now we have all possible attributes, set them
	},

	// retrieve all attrs from localStorage
	_load: function () {
		console.log('Model._load');

		var attrs = this.attributes,
			prefix = this._options.prefix,
			result;

		for (var attr in attrs) {
			// console.log('looping on ' + attr);
			// console.log('trying to find ' + prefix + attr);
			if ((result = localStorage.getItem(prefix + attr)) && (result !== undefined)) {
				attrs[attr] = result;
				// console.log('loading, found result: ', result);
				// console.log('setting' + attrs[attr] + ' to ' + result);
			}
		}
	},

	// persist attrs to localStorage
	_save: function () {
		console.log('Model._save');
		
		var attrs = this.attributes,
			prefix = this._options.prefix;

		for (var attr in attrs) {
			localStorage.setItem(prefix + attr, attrs[attr]); // prefix keys when in storage
			//console.log('setting localStorage: ' + prefix + attr + ' to ' + attrs[attr]);
		}
	},


	// get a key
	get: function (attr) {
		console.log('Model.get: ' + attr);
		// console.log('Model.get: ' + attr + ' with value of: ' + this.attributes[attr]);

		return this.attributes[attr];
	},

	// set a key to a value for the model
	// var attrs is {key: value, key2: value... }
	set: function (newAttrs) {
		console.log('Model.set', newAttrs);
		var attrs = this.attributes;

		for (var attr in newAttrs) {
			attrs[attr] = newAttrs[attr]; // set
		}

		this._save(); // persist new values
		return this; // do we want to return this?
	},

	// remove all attributes from storage
	deleteAll: function () {
		console.log('Model.clearAll');

		console.log('clearAll should do something!');
	},

	// user data
	attributes: { 
		id: 'jsgridoverlay-id',
		isActive: 0
	},

	// aka metadata
	_options:  { 
		prefix: 'jsgridoverlay-prefix-'
	}
});


// custom overlay model
var OverlayModel = Model.extend({
	toggleState: function(){
		var state = parseInt(this.get('isActive'), 10);
		var newState = state ? 0 : 1;

		this.set( {'isActive': newState} );

		return newState;
	},

	decreaseOpacity: function () {
		var currOpacity = this.get('opacity');
		var newOpacity = currOpacity - 0.1;
		newOpacity = newOpacity < (0.1) ? 0 : newOpacity; // float rounding, set to 0 when we're close

		this.set( {'opacity': newOpacity} );

		return newOpacity;
	},

	increaseOpacity: function () {
		var currOpacity = this.get('opacity');
		var newOpacity = parseFloat(currOpacity) + 0.1;
		newOpacity = newOpacity < 1 ? newOpacity : 1; // no point in having an opacity over 1

		this.set( {'opacity': newOpacity} );

		return newOpacity;
	}
});



// Controller.
// Handles events, updating the view and model accordingly
/**
 * @constructor
 */
 var Controller = Toolbox.Base.extend({});


/**
 * @constructor
 *
 * takes a template and a model.  handles visible things.
 */
var View = Toolbox.Base.extend({
	constructor: function (template, model) {
		console.log('View');

		// init some vars
		this._template = template || null;
		this._model = model || null;
		this.id = this._model.attributes.id || null;

		// create element with correct data
		this._create();
		this.update();

		// check if the view should be active on page load
		if (parseInt(m.attributes.isActive, 10)) { this.attach(); }
	},

	// process template into html string
	update: function (data) {
		console.log('View.update', data);

		data = data || this._model.attributes; // just use the assigned model if no data passed in

		// regenerate the template
		this._compiledTemplate =  _.template.call(this, this._template, data);
		this._element.innerHTML = this._compiledTemplate;
	},

	// create a dom element from the view id and generated template
	_create: function () {
		console.log('View._create');

		var el;
		
		// create an element with correct height and id
		el = document.createElement('div');
		el.id = this.id;
		this._element = el;

		return this._element;
	},

	attach: function () {
		console.log('View.attach');

		if (!document.getElementById(this.id)) {
			document.body.appendChild(this._element);
		}
	},

	detach: function () {
		console.log('View.detach');

		if (this._element && this._element.parentNode) {
			this._element.parentNode.removeChild(this._element);
		}
	},

	getElement: function() {
		return this._element;
	},

	_model: null,

	_template: '',

	_compiledTemplate: null,

	_element: null,

	id: null
});


var OverlayView = View.extend({
	handleDragOver: function (view) {
		view.dragOverEffects();

		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	},

	handleDragLeave: function (view) {
		view.dragLeaveEffects();
	},

	// temporary changes, don't tell the model
	dragOverEffects: function (){
		this._element.style.backgroundImage = 'none';
		this._element.style.backgroundColor = 'lime';
	},

	// remove any temporary highlighting
	dragLeaveEffects: function (){
		console.log('triggerdragleave');
		this._element.removeAttribute('style');
		this._element.style.backgroundImage = this._model.get('backgroundImage');
	},

	handleDrop: function(view) {
		console.log('drop!');
		console.log(arguments);
		event.stopPropagation();
		event.preventDefault();

		if (typeof FileReader !== "undefined") {

			// now to get the actual image data
			var files = event.dataTransfer.files; // files is a FileList of File objects.
			var f = files[0]; // we only want the first one, discard the rest
			var reader = new FileReader();

			reader.onload = function(f) {
				// sending a data url through the templating function is 
				// (understandably) SLOOOWWW, so modify the element directly
				var bg = 'url('+f.target.result+')';
				view._model.set( {'backgroundImage': bg} );
				view.setBackgroundImage();
			};

			// Read in the image file as a data URL. 
			reader.readAsDataURL(f);
		} else {
			// todo: some actual error handling
			console.log('FileReader not available');
		}
	},

	setBackgroundImage: function() {
		// manually set new bg image
		var bg = this._model.get('backgroundImage');
		console.log('bg is: ', bg);

		if (bg !== 'none') {
			this._element.style.backgroundImage = bg;

			// ditch the bg color
			myModel.set( {'backgroundColor': 'none'} );  // TODO: no explicit model refernce please
			this.update();
		}
	}
});

















var myData = {
	id: 'test-id',
	opacity: 0.5,
	backgroundPosition: 'top left',
	backgroundColor: 'green',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'auto',
	backgroundImage: 'none'
};

// get the viewport height
myData.height = (function () {
	// from http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
	var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0];
	return w.innerWidth||e.clientWidth||g.clientWidth;
})();

var modelOptions = {prefix: 'jsgridoverlay-customprefix-'};

var myModel = new OverlayModel(myData, modelOptions);










var overlayTemplate = '\
	<style type="text/css">\
	#<%= id %> {\
			width: 100%;\
			height: <%= height %>px;\
			position: absolute;\
			top: 0;\
			left: 0;\
			zIndex: 1000;\
			opacity: <%= opacity %>;\
			background-position: <%= backgroundPosition %>;\
			background-color: <%= backgroundColor %>;\
			background-repeat: <%= backgroundRepeat %>;\
			background-size: <%= backgroundSize %>;\
		}\
	</style>\
';

var myView = new OverlayView(overlayTemplate, myModel);







var AppController = Controller.extend({
	constructor: function(){
		this.setBackgroundImage();
		this.handleDragEvents();

		document.onkeydown = this.handleKeys;

	},

	handleKeys: function(event){
		console.log('appController.handleKeys');

		var toggleKeys = [59, 186, 90]; // ;
		var downOpacityKeys = [219, 91, 123]; // [
		var upOpacityKeys = [221, 93, 125]; // ]
		var allOpacityKeys = downOpacityKeys.concat(upOpacityKeys);

		if (event.ctrlKey) {
			console.log('ctrl key');
			
			// toggle overlay
			if (inArray(event.which, toggleKeys)) {
				console.log('toggle overlay');
				var state = myModel.toggleState();
				state ? myView.attach() : myView.detach();
				return false;
			}

			// decrease overlay opacity
			if (inArray(event.which, downOpacityKeys)) {
				console.log('opacityDown');
				myModel.decreaseOpacity();
			}

			// increase overlay opacity
			if (inArray(event.which, upOpacityKeys)) {
				console.log('opacityUp');
				myModel.increaseOpacity();
			}

			// show the changes
			myView.update();

			// depending on current state, we can activate or deactivate the
			// overlay by using the opacity adjust keys
			if (inArray(event.which, allOpacityKeys)) {
				console.log('allOpacity');
				var opacity = myModel.get('opacity');
				var isActive = myModel.get('isActive');

				// toggle if opacity is 0 or overlay is inactive
				if (opacity == +0 || isActive == +0) { 
					isActive = myModel.toggleState();
				}

				// make view match model state
				parseInt(isActive, 10) ? myView.attach() : myView.detach();

				return false;
			}
		}
	},

	handleDragEvents: function () {
		var el = myView.getElement();

		// TODO:  passing itself to itself to call itself seems weird?  is that weird?
		el.addEventListener('dragover', function(){myView.handleDragOver(myView)}, false);
		el.addEventListener('drop', function(){myView.handleDrop(myView)}, false);
		el.addEventListener('dragleave', function(){myView.handleDragLeave(myView)}, false);
	},

	setBackgroundImage: function () {
		myView.setBackgroundImage();
	}

});



var appController = new AppController();




