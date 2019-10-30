(function(window) {

var targetOrigin = '*',
	message;

var Message = function() {
	var source, origin;
	
    return {
    	on: function(callback) {
    		var handle = function(event) {
				event = event || window.event;
				source = event.source;
				origin = event.origin;
				
				callback(event);
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

message = Message();

message.on(function(event) {
	var data = JSON.parse(event.data),
		postData, value;
	
	if (targetOrigin !== '*' && event.origin !== targetOrigin) {
		return;
	}
	
	if (typeof data === 'object') {
		if (data.type !== 'clear') {
			postData = {
				key: data.key,
				type: data.type
			};
			
			if (data.type === 'get') {
				value = window.localStorage.getItem(data.key);
				postData.value = value;
			} else if (data.type === 'set') {
				value = typeof data.value !== 'string' ? JSON.stringify(data.value) : data.value;
				window.localStorage.setItem(data.key, value);
			} else if (data.type === 'remove') {
				window.localStorage.removeItem(data.key);
			}
			
			message.post(postData);
		} else {
			window.localStorage.clear();
		}
	}
});
	
})(window);