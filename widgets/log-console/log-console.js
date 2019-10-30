(function(window) {

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

var query = getQueryString();

var log = function(message, type) {
	if (!window.jQuery || !query.mode || query.mode !== 'debug') {
		return false;
	}
	
	var types = {
			log: 'log-console-log',
			info: 'log-console-info',
			warn: 'log-console-warn',
			error: 'log-console-error'
		},
		
		$console, $message, cells,
		
		styleText = function(text) {
			var type = $.type(text),
				ret, items;
			
			switch (type) {
				case 'number':
					ret = '<span class="log-console-text-number">' + text + '</span>';
					break;
				case 'boolean':
					ret = '<span class="log-console-text-boolean">' + text + '</span>';
					break;
				case 'string':
					ret = '<span class="log-console-text-string">"' + text + '"</span>';
					break;
				case 'object':
					items = [];
					$.each(text, function(label, value) {
						items.push('<span class="log-console-text-label">' + label + ':</span>' + 
							styleText(value));
					});
					ret = '<span class="log-console-text-wl">{</span>' +
						items.join(',') + '<span class="log-console-text-wr">}</span>';
					break;
				case 'array':
					items = [];
					$.each(text, function(i, value) {
						items.push('<span class="log-console-text-item">' + styleText(value) + '</span>');
					});
					ret = '<span class="log-console-text-wl">[</span>' +
						items.join(',') + '<span class="log-console-text-wr">]</span>';
					break;
				default:
					ret = '<span class="log-console-text-others">' + text + '</span>';
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
	
	$console = $('.log-console');
	
	if (!$console.length) {
		$console = $('<div class="log-console">' +
			'<div class="log-console-toolbar">' +
			'<button type="button" class="log-console-button log-console-button-clear">Clear</button>' +
			'<button type="button" class="log-console-button log-console-button-collapse">Collapse</button>' +
			'</div>' +
			'<div class="log-console-content"></div>' +
			'</div>')
				.appendTo('body');
		
		$console
			.on('click', '.log-console-button-clear', function() {
				$console.find('.log-console-content').empty();
			})
			.on('click', '.log-console-button-collapse', function() {
				$console.find('.log-console-content').toggle();
			});
	}
	
	$message = $('<p>', {
		'class': (type && types[type] ? types[type] : types['log'])
	})
		.append(styleText(message));
	
	$console.find('.log-console-content').append($message);
};

window.logConsole = log;

})(window);