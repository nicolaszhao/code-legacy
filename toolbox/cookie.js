/*
 * cookie 相关
 * Sep 12th, 2012
 */
var cookie = {
	get: function(name) {
		var pattern = '(?:; )?' + encodeURIComponent(name) + '=([^;]*);?', regCookie = new RegExp(pattern);

		return regCookie.test(document.cookie) ? decodeURIComponent(RegExp['$1']) : null;
	},

	set: function(name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);

		if ( expires instanceof Date) {
			cookieText += '; expires=' + expires.toGMTString();
		}

		if (path) {
			cookieText += '; path=' + path;
		}

		if (domain) {
			cookieText += '; domain=' + domain;
		}

		if (secure) {
			cookieText += '; secure';
		}

		document.cookie = cookieText;
	},

	unset: function(name, path, domain, secure) {

		// 设置失效时间为1970年1月1日（初始化为0ms的Date对象的值）
		this.set(name, '', new Date(0), path, domain, secure);
	}

};

// 子cookie
// 格式：name=name1=value1&name2=value2&name3=value3...
var subCookie = {

	// 获取cookie的子cookie值
	get: function(name, subName) {
		var subCookies = this.getAll(name);

		if (subCookies) {
			return subCookies[subName];
		} else {
			return null;
		}
	},

	// 获取cookie的所有子cookie的对象集合
	getAll: function(name) {
		var pattern = '(?:; )?' + encodeURIComponent(name) + '=([^;]*);?', 
			regCookie = new RegExp(pattern), 
			cookieValue, 
			subCookies, 
			i, 
			len, 
			parts, 
			ret = {};

		if (regCookie.test(document.cookie)) {
			cookieValue = RegExp['$1'];

			if (cookieValue.length > 0) {
				subCookies = cookieValue.split('&');
				for ( i = 0, len = subCookies.length; i < len; i++) {
					parts = subCookies[i].split('=');
					ret[ decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
				}

				return ret;
			}
		}

		return null;
	},

	set: function(name, subName, value, expires, path, domain, secure) {
		var subcookies = this.getAll(name) || {};

		subcookies[subName] = value;
		this.setAll(name, subcookies, expires, path, domain, secure);
	},

	setAll: function(name, subcookies, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + '=', subcookieParts = [], subName;

		for (subName in subcookies ) {
			if (subName.length > 0 && subcookies.hasOwnProperty(subName)) {
				subcookieParts.push(encodeURIComponent(subName) + '=' + encodeURIComponent(subcookies[subName]));
			}
		}

		if (subcookieParts.length) {
			cookieText += subcookieParts.join('&');
		}
		if ( expires instanceof Date) {
			cookieText += '; expires=' + expires.toGMTString();
		}
		if (path) {
			cookieText += '; path=' + path;
		}
		if (domain) {
			cookieText += '; domain=' + domain;
		}
		if (secure) {
			cookieText += '; secure';
		}

		document.cookie = cookieText;
	},

	unset: function(name, subName, path, domain, secure) {
		var subcookies = this.getAll(name);

		if (subcookies) {
			delete subcookies[subName];
			this.setAll(name, subcookies, null, path, domain, secure);
		}
	},

	unsetAll: function(name, path, domain, secure) {
		this.setAll(name, null, new Date(0), path, domain, secure);
	}

}; 