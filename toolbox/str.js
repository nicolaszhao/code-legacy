/*
 * 与字符串处理相关
 * date: Sep 25th, 2012
 */
var str = {
	// replace '<>"&' to HTML character encoding
	entityify: function(text) {
		var character = {
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;',
			'"': '&quot;'
		};

		return text.replace(/[<>"&]/g, function(match) {
			return character[match];
		});
	},

	deentityify: function(text) {
		var entity = {
			quot: '"',
			lt: '<',
			gt: '>'
		};

		return text.replace(/&([^&;]+);/g, function(match, key) {
			var ret = entity[key];

			return typeof ret === 'string' ? ret : match;
		});
	},

	// example: format('Do {0} love {1}? Yes, {2} love {0}!', 'you', 'me', 'I');
	// return: 'Do you love me? Yes, I love You!'
	format: function(text) {
		var params = Array.prototype.slice.call(arguments, 1);

		return text.replace(/\{(\d+)\}/g, function(m, i) {
			return params[i];
		});
	},

	trim: function(text) {
		return text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},

	stripHTML: function(text) {
		return text.replace(/<(?:.|\s)*?>/g, '');
	},

	filter: function(text, maxlength) {
		if (text === '')
			return '';

		text = text

		// 将2个以上的空字符转换为一个
		.replace(/\s{2,}/g, ' ')

		// 将所有HTML的换行标记转换为换行符
		.replace(/<br\s*\/?>/g, '\n')

		// 将所有HTML的空格标记转换为一个空字符
		.replace(/(\s*&(n|N)(b|B)(s|S)(p|P);\s*)+/g, ' ')

		// 将单个单引号转换为成对的单引号
		.replace(/'/g, "''");

		// 过滤掉两端空格及HTML标记
		text = this.trim(text);
		text = this.stripHTML(text);

		if ( typeof maxlength === 'number') {
			text = text.substring(0, maxlength);
		}

		return text;
	}

};
