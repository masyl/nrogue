(function () {
	var r = require;
	module.exports = {
		in: r('util').inherits,
		em: r('events').EventEmitter,
	    ex: function extend(dest, source) {
	        for (var prop in source) {
	            dest[prop] = source[prop];
	        }
	    }
	};
})();