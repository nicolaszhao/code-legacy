
// Depends: utils
var utils = require('utils');

(function(global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(global);
	} else {
		factory(global);
	}
}(window, function(window) {
	
var ErrorMessages = {
	ACCESS_ERROR: '访问接口时错误: 无法访问接口 [{0}]',
	REQUEST_ERROR: '请求接口 {0} 时错误: 在 window 对象上没有找到对应的回调函数 [{1}]',
	NEED_ID_ERROR: '请求接口 {0} 时错误: 取消监听绑定时缺少必要的 ReqID'
};	

var RequestIdCounter = 1000,
	query = utils.getQueryString();

var replaceControlChar = function(str) {
	return str.replace(/[\x00-\x19]/g, '');
}; 

var Request = function() {
	if (!(this instanceof Request)) {
		return new Request();
	}
};

Request.prototype = {
	constructor: Request,
	
	_getId: (function(){
        if (typeof window.external === 'undefined' || typeof window.external.GetNextReqID === 'undefined') {
            return function() {
                var reqId = (+new Date() + Math.ceil(Math.random() * 99999)) + '';
                
                RequestIdCounter += 1;
                reqId = parseInt(reqId.substr(-9, 9)) + RequestIdCounter;
                
                return reqId;
            };
        }else{
            return function() {
                return window.external.GetNextReqID();
            };
        }
    }()),

	_post: function(id, cmd, callback, args) {
		if (typeof window.external === 'undefined' || typeof window.external.StartRequest === 'undefined') {
			throw new Error(ErrorMessages.ACCESS_ERROR.replace('{0}', 'window.external.StartRequest'));
		}
		
		return window.external.StartRequest(id, cmd, callback, args, '');
	},
	
	createCallback: function(callback, cmd) {
		this.callbackMaps = this.callbackMaps || {};
		
		var fn = callback,
			that = this;
		
        callback = 'CALLBACK_' + (+new Date() + Math.ceil(Math.random() * 99999)) ;
        if (typeof fn === 'string') {
            this.callbackMaps[fn] = callback;
        }
        
        window[callback] = function (reqId, data) {
        	var res = data;
        	
            if (typeof data === 'string') {
                data = replaceControlChar(data);
                data = JSON.parse(data);
            }
            that.call(fn, cmd, data);
            
            that.log('Request callback done.', 'info');
            that.log({
            	command: cmd,
            	callback: callback,
            	response: data
            }, 'info');
			
        };
        
        this.currentCallback = 'window.' + callback;
        return this.currentCallback;
	},
	
	call: function(fn) {
		var args = Array.prototype.slice.call(arguments, 1),
			props, parent, context;
		
		if (typeof fn === 'function') {
	        return fn.apply(null, args);
	    }
	    
	    props = fn.split('.');
	    parent = window;
	    for (var i = 0; i < props.length; i++) {
	        context = parent;
	        parent = parent[props[i]];
	        if (typeof parent === 'undefined') {
	            return;
	        }
	    }
	
	    if (typeof parent === 'function') {
	        parent.apply(context, args);
	    }
	},
	
	// 当传入 cmd 包含 .removeListener 的事件请求时, 需要传入ReqID,
	// 此时的callback充当 ReqID 传入
	post: function(cmd, args, callback) {
		cmd = cmd + '';
		
		var len = arguments.length,
			reqId,
			
			log = function(len, cmd, args, callback) {
				this.log('Request post, post method receive ' + len + ' arguments.');
				this.log({
					command: cmd,
					'request-data': args || '[]',
					callback: callback || 'no callback'
				});
			};
		
		try {
			reqId = this._getId();
			
			if (len === 1) {
				callback = '';
				args = '[]';
				
				log.apply(this, [len, cmd, args]);
			}
			
			if (len === 2) {
				if (cmd.indexOf('.addListener') !== -1) {
					if (typeof args === 'function') {
						callback = this.createCallback(args, cmd);
					}
					
					if (typeof args === 'string') {
						if (args.split('.').length > 1) {
							callback = this.createCallback(args, cmd);
						} else {
							if (typeof window[args] === 'function') {
								callback = args;
							} else {
								throw new Error(ErrorMessages.REQUEST_ERROR.replace('{0}', cmd).replace('{1}', args));
							}
						}
					}
					
					if (Object.prototype.toString.call(args) === '[object Array]' && 
							typeof args[0] === 'function') {
						
						callback = this.createCallback(args[0], cmd);
					}
					
	                args = '[]';
	                
	                log.apply(this, [len, cmd, args, callback]);
				} else {
					if (typeof args === 'function') {
	                	callback = this.createCallback(args, cmd);
	                	args = '[]';
	                } else if (typeof args === 'string') {
						if (args.indexOf('[') !== 0 && args.split('.').length > 1) {
							callback = this.createCallback(args, cmd);
							args = '[]';
						} else {
							if (typeof window[args] === 'function') {
								callback = args;
								args = '[]';
								
							// args may be '[{"key":"value"}, ...]'
							} else {
								callback = '';
							}
						}
					} else if (Object.prototype.toString.call(args) === '[object Array]') {
						if (typeof args[0] === 'function') {
							callback = this.createCallback(args[0], cmd);
							args = '[]';
						} else {
							callback = '';
							args = JSON.stringify(args);
						}
					}
	                
	                log.apply(this, [len, cmd, args, callback]);
				}
			}
			
			if (len === 3) {
				if (cmd.indexOf('.removeListener') !== -1) {
					reqId = callback;
					if (!reqId) {
						throw new Error(ErrorMessages.NEED_ID_ERROR.replace('{0}', cmd));
					}
					
					if (typeof args === 'function') {
						callback = this.createCallback(args, cmd);
					}
					
					if (typeof args === 'string') {
						if (args.split('.').length > 1) {
							callback = this.createCallback(args, cmd);
						} else {
							if (typeof window[args] === 'function') {
								callback = args;
							} else {
								throw new Error(ErrorMessages.REQUEST_ERROR.replace('{0}', cmd).replace('{1}', args));
							}
						}
					}
					
					if (Object.prototype.toString.call(args) === '[object Array]' && 
							typeof args[0] === 'function') {
						
						callback = this.createCallback(args[0], cmd);
					}
					
	                args = '[]';
	                
	                log.apply(this, [len, cmd, args, callback]);
				} else {
					if (typeof callback === 'function') {
						callback = this.createCallback(callback, cmd);
					} else if (typeof callback === 'string') {
						if (callback.split('.').length > 1) {
							callback = this.createCallback(callback, cmd);
						} else {
							if (typeof window[callback] === 'function') {
								callback = callback;
							} else {
								throw new Error(ErrorMessages.REQUEST_ERROR.replace('{0}', cmd).replace('{1}', callback));
							}
						}
					}
					
					if (Object.prototype.toString.call(args) === '[object Array]') {
	                    args = JSON.stringify(args);
					} else {
						
						// args may be '[{"key":"value"}, ...]'
					}
	                
	                log.apply(this, [len, cmd, args, callback]);
				}
			}
			
			this._post(reqId, cmd, callback, args);
			
	    } catch (e) {
	    	this.log((e.description ? e.description : e.message), 'error');	    	
	        throw new Error(e.message);
	    }
	    
	    return reqId;
	},
	
	log: function(message, type) {
		if (!window.jQuery || !query.mode || query.mode !== 'debug') {
			return false;
		}
		
		var types = {
				log: 'request-console-log',
				info: 'request-console-info',
				warn: 'request-console-warn',
				error: 'request-console-error'
			},
			
			$console, $message, cells,
			
			styleText = function(text) {
				var type = $.type(text),
					ret, items;
				
				switch (type) {
					case 'number':
						ret = '<span class="request-console-text-number">' + text + '</span>';
						break;
					case 'boolean':
						ret = '<span class="request-console-text-boolean">' + text + '</span>';
						break;
					case 'string':
						ret = '<span class="request-console-text-string">"' + text + '"</span>';
						break;
					case 'object':
						items = [];
						$.each(text, function(label, value) {
							items.push('<span class="request-console-text-label">' + label + ':</span>' + 
								styleText(value));
						});
						ret = '<span class="request-console-text-wl">{</span>' +
							items.join(',') + '<span class="request-console-text-wr">}</span>';
						break;
					case 'array':
						items = [];
						$.each(text, function(i, value) {
							items.push('<span class="request-console-text-item">' + styleText(value) + '</span>');
						});
						ret = '<span class="request-console-text-wl">[</span>' +
							items.join(',') + '<span class="request-console-text-wr">]</span>';
						break;
					default:
						ret = '<span class="request-console-text-others">' + text + '</span>';
						break;
				}
				
				return ret;
			}; 
		
		if (query.console && query.console === 'browser' && typeof console !== 'undefined') {
			if ($.type(message) === 'array' || $.type(message) === 'object') {
				message = JSON.stringify(message);
			}
			(type && console[type] ? console[type](message) : console.log(message));
			return;
		}
		
		$console = $('.request-console');
		
		if (!$console.length) {
			$console = $('<div class="request-console">' +
				'<div class="request-console-toolbar">' +
				'<button type="button" class="request-console-button request-console-button-clear">Clear</button>' +
				'<button type="button" class="request-console-button request-console-button-collapse">Collapse</button>' +
				'</div>' +
				'<div class="request-console-content"></div>' +
				'</div>')
					.appendTo('body');
			
			$console
				.on('click', '.request-console-button-clear', function() {
					$console.find('.request-console-content').empty();
				})
				.on('click', '.request-console-button-collapse', function() {
					$console.find('.request-console-content').toggle();
				});
		}
		
		$message = $('<p>', {
			'class': (type && types[type] ? types[type] : types['log'])
		})
			.append(styleText(message));
		
		$console.find('.request-console-content').append($message);
	}
};

window.Request = Request;

return Request;

}));