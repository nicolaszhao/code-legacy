/**
 * description: 一个简易的DOM事件绑定对象，类似于jQuery，并提供可自定义的事件绑定。
 * author: Nicolas.Zhao
 * date: Jan 9, 2015
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define('simpleevent', [], factory);
	} else {
		factory();
	}
}(function() {
	
var toString = Object.prototype.toString,
	push = Array.prototype.push,
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;

var isArraylike = function(obj) {
	var length = obj.length,
		type = typeof obj;
		
	if (type === 'function' || Simpleevent.isWindow(obj)) {
		return false;
	}
	
	if (obj.nodeType === 1 && length) {
		return true;
	}
	
	return toString.call(obj) === '[object Array]' || length === 0 ||
		typeof length === 'number' && length > 0 && (length - 1) in obj;
};

var Simpleevent = function(selector) {
	return new Simpleevent.prototype.init(selector);
};

Simpleevent.prototype = {
	constructor: Simpleevent,
	length: 0,
	
	find: function(selector) {
		var i,
			ret = [],
			self = this,
			len = self.length;
		
		for (i = 0; i < len; i++) {
			Simpleevent.find(selector, self[i], ret);
		}
		
		ret = Simpleevent.merge(this.constructor(), ret);
		
		return ret;
	},
	
	each: function(callback) {
		return Simpleevent.each(this, callback);	
	},
	
	ready: function(fn) {
		var ready = function() {
				if (!document.body) {
					return setTimeout(ready);
				}
				
				Simpleevent.isReady = true;
				
				fn.call(document, Simpleevent);
			},
			
			detach = function() {
				if (document.addEventListener) {
					document.removeEventListener('DOMContentLoaded', completed, false);
					window.removeEventListener('load', completed, false);
				} else {
					document.detachEvent('onreadystatechange', completed);
					window.detachEvent('onload', completed);
				}
			},
			
			completed = function() {
				if (document.addEventListener || event.type === 'load' || document.readyState === 'complete') {
					detach();
					ready();
				}
			},
			
			top;
		
		if (document.readyState === 'complete') {
			setTimeout(ready);
		} else if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', completed, false);
			window.addEventListener('load', completed, false);
		} else {
			document.detachEvent('onreadystatechange', completed);
			window.detachEvent('onload', completed);
			
			try {
				top = document.frameElement == null && document.documentElement;
			} catch(e) {}
			
			if (top && top.doScroll) {
				(function doScrollCheck() {
					if (!Simpleevent.isReady) {
						try {
							top.doScroll('left');
						} catch(e) {
							return setTimeout(doScrollCheck, 50);
						}
						
						detach();
						ready();
					}
				})();
			}
		}
		
		return this;
	}
};

Simpleevent.isReady = false;

Simpleevent.merge = function(first, second) {
	var len = second.length,
		j = 0,
		i = first.length;
		
	while(j < len) {
		first[i++] = second[j++];
	}
	
	first.length = i;
	
	return first;
};

Simpleevent.makeArray = function(arr, results) {
	var ret = results || [];
	
	if (arr != null) {
		if (isArraylike(arr)) {
			Simpleevent.merge(ret,
				typeof arr === 'string' ?
				[arr] : arr
			);
		} else {
			push.call(ret, arr);
		}
	}
	
	return ret;
};

Simpleevent.isWindow = function(obj) {
	return obj != null && obj == obj.window;
};

Simpleevent.each = function(obj, callback) {
	var value,
		i = 0,
		length = obj.length,
		isArray = isArraylike(obj);
		
	if (isArray) {
		for (; i < length; i++) {
			value = callback.call(obj[i], i, obj[i]);
			if (value === false) {
				break;
			}
		}
	} else {
		for (i in obj) {
			value = callback.call(obj[i], i, obj[i]);
			if (value === false) {
				break;
			}
		}
	}
	
	return obj;
};

Simpleevent.find = function(selector, context, results) {
	var match, m, elem, nodeType;
	
	context = context || document;
	results = results || [];
	nodeType = context.nodeType;
	
	if (typeof selector !== 'string' || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
		
		return results;
	}
	
	match = rquickExpr.exec(selector);
	
	if (nodeType !== 11 && match) {
		if (m = match[1]) {
			if (nodeType === 9) {
				elem = context.getElementById(m);
				if (elem && elem.parentNode) {
					if (elem.id === m) {
						results.push(elem);
						return results;
					}
				} else {
					return results;
				}
			}
		}
		
	}
};

var rootSpet,

	init = Simpleevent.prototype.init = function(selector) {
		var match, elem;
		
		if (!selector) {
			return this;
		}
		
		if (typeof selector === 'string') {
			match = rquickExpr.exec(selector);
			
			if (match && match[1]) {
				elem = document.getElementById(match[1]);
				
				if (elem && elem.parentNode) {
					if (elem.id !== match[1]) {
						return rootSpet.find(selector);
					}
					
					this[0] = elem;
					this.length = 1;
				}
				
				return this;
			} else {
				return rootSpet.find(selector);
			}
		} else if (selector.nodeType) {
			this[0] = selector;
			this.length = 1;
			return this;
		} else if (typeof selector === 'function') {
			return rootSpet.ready(selector);
		}
		
		return Simpleevent.makeArray(selector, this);
	};
	
init.prototype = Simpleevent.prototype;
rootSpet =  Simpleevent(document);

window.Simpleevent = window.S = Simpleevent;
	
}));
