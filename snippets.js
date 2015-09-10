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