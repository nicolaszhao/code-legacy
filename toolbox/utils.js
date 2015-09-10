var keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	NUMPAD_ADD: 107,
	NUMPAD_DECIMAL: 110,
	NUMPAD_DIVIDE: 111,
	NUMPAD_ENTER: 108,
	NUMPAD_MULTIPLY: 106,
	NUMPAD_SUBTRACT: 109,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

var formatSize = function(bytes){
    var i = -1;                                    
    do {
        bytes = bytes / 1024;
        i++;  
    } while (bytes >= 1024);
    
    return parseFloat(Math.max(bytes, 0.1).toFixed(2)) + ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];          
};

var isSupportFixed = function() {
	var outer = document.createElement('div'), 
		inner = document.createElement('div'),
		ret = true;

	outer.style.position = 'absolute';
	outer.style.top = '200px';

	inner.style.position = 'fixed';
	inner.style.top = '100px';

	outer.appendChild(inner);
	document.body.appendChild(outer);

	if (inner.getBoundingClientRect && 
			inner.getBoundingClientRect().top === outer.getBoundingClientRect().top) {
		
		ret = false;
	}
	
	document.body.removeChild(outer);
	return ret;
}; 

var getQueryString = function(url) {
	var args = {}, 
		rsearch = /\?([^#]+)#?/,
		searchIndex, qs, items, 
		item, name, value;
		
	if (!url) {
		url = location.href;
	}
	
	searchIndex = url.indexOf('?');
	qs = (searchIndex !== -1 ? rsearch.exec(url)[1] : '');
	items = qs.split('&');
	
	for (var i = 0, len = items.length; i < len; i++) {
		item = items[i].split('=');
		name = decodeURIComponent(item[0]);
		value = decodeURIComponent(item[1]);
		args[name] = value;
	}

	return args;
};


