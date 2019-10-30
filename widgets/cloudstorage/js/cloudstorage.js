(function(window) {

// TODO： 按需要打开接受消息来源验证
// var targetOrigin = 'http://webapi.br.baidu.com';
var targetOrigin = '*';

var Message = function() {
	var source, origin;
	
    return {
    	on: function(callback) {
    		var handle = function(event) {
				event = event || window.event;
				callback(event);
				source = event.source;
				origin = event.origin;
			};
			
    		if (window.addEventListener) {
	           	window.addEventListener('message', handle, false);
	        } else if (window.attachEvent) {
	            window.attachEvent('onmessage', handle);
	        }
    	},
    	
    	post: function(message, targetOrigin, targetSource) {
    		if (typeof window.postMessage !== 'function') {
    			return;
    		}
    		
    		if (typeof message !== 'string') {
    			message = JSON.stringify(message);
    		}
    		
    		targetOrigin = targetOrigin || origin;
    		targetSource = targetSource || source;
    		targetSource.postMessage(message, targetOrigin);
    	}
    };
};

var Callbacks = function() {
	var list = [],
		promise = {
			done: function(callback) {
				list.push(callback);
				return this;
			},
			promise: function() {
				return promise;
			}
		},
		callbacks = {};
		
	for (var fn in promise) {
		if (promise.hasOwnProperty(fn)) {
			callbacks[fn] = promise[fn];
		}
	}
	
	callbacks.resolve = function(value) {
		var len = list.length;
		while(len--) {
			list.shift()(value);
		}
	};
	
	return callbacks;
};

var CloudStorage = function(targetWindow) {
	var callbacks = {},
		message = Message(),
		methods = ['set', 'get', 'remove'],
		cloudStorage = {};
	
	message.on(function(event) {
		var data = JSON.parse(event.data);
		
		if (targetOrigin !== '*' && event.origin !== targetOrigin) {
			return;
		}
		
		if (typeof data === 'object' && callbacks[data.type + '-' + data.key]) {
			callbacks[data.type + '-' + data.key].resolve(data.value || null);
		}
	});
	
	for (var i = 0, len = methods.length; i < len; i++) {
		(function(i) {
			cloudStorage[methods[i] + 'Item'] = function() {
				var data = {
						key: arguments[0],
						type: methods[i]
					},
					cb = callbacks[methods[i] + '-' + arguments[0]] = Callbacks();
				
				if (data.type === 'set') {
					data.value = arguments[1];
				}
				
				message.post(data, '*', targetWindow);
				return cb.promise();
			};
		})(i);
	}
	
	cloudStorage.clear = function() {
		message.post({type: 'clear'}, '*', targetWindow);
	};
	
	return cloudStorage;
};

window.createCloudStorage = function(remote, callback) {
	var div, iframe,
		cb = Callbacks();
	
	div = document.createElement('div');
	div.style.display = 'none';
	
	iframe = document.createElement('iframe');
	iframe.onload = function() {
		window.cloudStorage = CloudStorage(iframe.contentWindow);
		
		if (typeof callback === 'function') {
			callback();
		}
		
		cb.resolve();
	};
	iframe.src = remote;
	
	div.appendChild(iframe);
	document.body.insertBefore(div, document.body.firstChild);
	
	return cb.promise();
};

})(window);
