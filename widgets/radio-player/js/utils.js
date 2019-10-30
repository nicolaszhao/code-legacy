var utils = {
	getRandoms: function(data, length) {
		var copy = data.concat([]),
			ret = [],
			index;
		
		while(length-- && copy.length) {
			index = Math.floor(Math.random() * copy.length);
			ret.push(copy.splice(index, 1)[0]);
		}
	    
	    return ret;
	},
	
	getHost: function(url) {
		return /^(http:\/\/[^\/]+)\//.test(url) ? RegExp.$1 : '';
	}
};