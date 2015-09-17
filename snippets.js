var escapeRichText = function(text) {
	if (typeof text !== 'string') {
		return '';
	}
	
	var rscript = /<script[^>]*>(?:(?:(?!<\/script>).)*<\/script>)?/gi,
		rstyle = /<style[^>]*>(?:(?!@import|<\/style>).)*@import(?:(?!<\/style>).)+<\/style>/gi,
		rlink = /<link(?:(?!\.css).)+\.css[^>]*>/gi,
		rinnerevent = /on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s\/>]+)/gi,
		rinnerexpress = /javascript:/gi;
	
	return text.replace(rscript, '')
		.replace(rstyle, '')
		.replace(rlink, '')
		.replace(rinnerevent, '')
		.replace(rinnerexpress, '');
};

var delay = function(delay) {
	return $.Deferred(function(defer) {
		setTimeout(defer.resolve, delay);
	});
};

var formatSize = function(bytes){
    var i = -1;                                    
    do {
        bytes = bytes / 1024;
        i++;  
    } while (bytes >= 1024);
    
    return parseFloat(Math.max(bytes, 0.1).toFixed(2)) + ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];          
};

// 阶乘
var factorialList = function(n, m) {
	var row = function(n, m) {
		m = m || 1;
		var ret = n + ' * ' + m + ' = ' + (n * m) + '; ';

		if (m++ < n) {
			return ret += row(n, m);
		} else {
			return ret;
		}
	};

	var ret = row(n);

	if (n++ < m) {
		return ret += '\n' + factorialList(n, m);
	} else {
		return ret;
	}
}; 
