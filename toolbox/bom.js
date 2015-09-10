/*
 * 与浏览器操作相关
 * date: July 12th, 2012
 */
var bom = {
	detectPlugin: {

		// 非IE
		hasPlugin: function(name) {
			name = name.toLowerCase();
			for (var i = 0, len = navigator.plugins.length; i < len; i++) {
				if (navigator.plugins[i].name.toLowerCase().indexOf(name) > -1) {
					return true;
				}
			}
			return false;
		},

		// name: COM对象唯一标识符全名
		hasIEPlugin: function(name) {
			try {
				new ActiveXObject(name);
				return true;
			} catch (ex) {
				return false;
			}
		},

		// 检测所有浏览器中的flash
		hasFlash: function() {
			var ret = this.hasPlugin('Flash');

			if (!ret) {
				ret = this.hasIEPlugin('ShockwaveFlash.ShockwaveFlash');
			}

			return ret;
		}

	},

	// 为指定url添加查询字符串
	// 如果参数为2个，第2个则指定为对象字面量形式: {name: value},
	// 如果参数有3个，第2个指定为name，第3个为value
	addQueryString: function(url) {
		var qs, key, val;

		url += (url.indexOf('?') == -1 ? '?' : '&');

		if ( typeof arguments[1] === 'string') {
			url += encodeURIComponent(arguments[1]) + '=' + encodeURIComponent(arguments[2]);
		} else if ( typeof arguments[1] === 'object') {
			qs = [];
			for (key in arguments[1]) {
				val = arguments[1][key];
				qs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
			}
			url += qs.join('&');
		}

		return url;
	},

	getQueryString: function() {
		var qs = (location.search.length > 0 ? location.search.substring(1) : ''), 
			args = {}, 
			items = qs.split('&'), 
			item = null, 
			name = null, 
			value = null;

		for (var i = 0, len = items.length; i < len; i++) {
			item = items[i].split('=');
			name = decodeURIComponent(item[0]);
			value = decodeURIComponent(item[1]);
			args[name] = value;
		}

		return args;
	},
	

	/*
	 * 设置浏览器的默认主页
	 * author: Nicolas.Z
	 * date: 2011-2-24
	 *
	 * example:
	 * var a = document.getElementById("anchor");
	 * setBrowserDefaultPage(a, "http://www.google.com/");
	 */ 
	 setBrowserDefaultPage: function(elem, url) {
		try {
			elem.style.behavior = 'url(#default#homepage)';
			elem.setHomePage(url);
		} catch (e) {
			if (window.netscape) {
				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				} catch (e) {
					throw new Error("抱歉，此操作被浏览器拒绝！\n\n请在浏览器地址栏输入“about:config”并回车然后将[signed.applets.codebase_principal_support]设置为'true'");
				}
			} else {
				throw new Error("抱歉，您所使用的浏览器无法完成此操作。\n\n您需要手动将" + url + "设置为首页。");
			}
		}
	}
};
