/**
 * 客户端用户代理检测
 * date: July 11th, 2012
 */
var client = (function() {

	// 浏览器呈现引擎
	var engine = {
		ie: 0,
		gecko: 0,
		webkit: 0,
		khtml: 0,
		opera: 0,

		// 完整的版本号
		ver: null
	},

	// 浏览器
	browser = {
		ie: 0,
		firefox: 0,
		konq: 0,
		opera: 0,
		chrome: 0,
		safari: 0,

		// 具体的版本号
		ver: null
	},

	// 平台、设备和操作系统
	system = {
		win: false,
		mac: false,
		x11: false,

		// 移动设备
		iphone: false,
		ipad: false,
		ipod: false,
		ios: false,
		android: false,
		nokiaN: false,
		winMobile: false,

		// 游戏系统
		wii: false,
		ps: false
	}, 
	ua = navigator.userAgent, 
	p = navigator.platform, 
	safariVersion;

	if (window.opera) {
		engine.ver = browser.ver = window.opera.version();
		engine.opera = browser.opera = parseFloat(engine.ver);
	} else if (/AppleWebKit\/(\S+)/.test(ua)) {
		engine.ver = RegExp['$1'];
		engine.webkit = parseFloat(engine.ver);

		// 确定是Chrome还是Safari
		if (/Chrome\/(\S+)/.test(ua)) {
			browser.ver = RegExp['$1'];
			browser.chrome = parseFloat(engine.ver);
		} else if (/Version\/(\S+)/.test(ua)) {
			browser.ver = RegExp['$1'];
			browser.safari = parseFloat(browser.ver);
		} else {

			// 近似地确定版本号
			safariVersion = 1;

			if (engine.webkit < 100) {
				safariVersion = 1;
			} else if (engine.webkit < 312) {
				safariVersion = 1.2;
			} else if (engine.webkit < 412) {
				safariVersion = 1.3;
			} else {
				safariVersion = 2;
			}

			browser.safari = browser.ver = safariVersion;
		}
	} else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
		engine.ver = browser.ver = RegExp['$1'];
		engine.khtml = browser.konq = parseFloat(engine.ver);
	} else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
		engine.ver = RegExp['$1'];
		engine.gecko = parseFloat(engine.ver);

		// 确定是不是Firefox
		if (/Firefox\/(\S+)/.test(ua)) {
			browser.ver = RegExp['$1'];
			browser.firefox = parseFloat(browser.ver);
		}
	} else if (/MSIE ([^;]+)/.test(ua)) {
		engine.ver = browser.ver = RegExp['$1'];
		engine.ie = browser.ie = parseFloat(engine.ver);
	}

	browser.ie = engine.ie;
	browser.opera = engine.opera;

	system.win = p.indexOf('Win') == 0;
	system.mac = p.indexOf('Mac') == 0;
	system.x11 = (p == 'X11') || (p.indexOf('Linux') == 0);

	// 检测Windows操作系统
	if (system.win) {

		// 这个正则表达式对于 Windows ME的版本判断是错误的，
		// Windows ME的用户代理字符串应该显示为Win 9x 4.90或Windows ME
		// 原来（JavaScript高级程序设计第2版）的正则表达式代码：/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/
		if (/Win(?:dows)?\s?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
			if (RegExp['$1'] == 'NT') {
				switch (RegExp['$2']) {
					case '5.0':
						system.win = '2000';
						break;
					case '5.1':
						system.win = 'XP';
						break;
					case '6.0':
						system.win = 'Vista';
						break;
					case '6.1':
						system.win = '7';
						break;
					default:
						system.win = 'NT';
				}
			} else if (RegExp['$1'] == '9x') {
				system.win = 'ME';
			} else {
				system.win = RegExp['$1'];
			}
		}
	}

	// 移动设备
	system.iphone = ua.indexOf('iPhone') > -1;
	system.ipad = ua.indexOf('iPad') > -1;
	system.ipod = ua.indexOf('iPod') > -1;
	system.nokiaN = ua.indexOf('NokiaN') > -1;

	// windows mobile
	if (system.win == 'CE') {
		system.winMobile = system.win;
	} else if (system.win == 'Ph') {
		if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
			system.win = 'Phone';
			system.winMobile = parseFloat(RegExp['$1']);
		}
	}

	// ios版本
	if (system.mac && ua.indexOf('Mobile') > -1) {
		if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
			system.ios = parseFloat(RegExp.$1.replace('_', '.'));
		} else {

			// 不能真正检测出来，所以只能猜测
			system.ios = 2;
		}
	}

	//检测Android版本
	if (/Android (\d+\.\d+)/.test(ua)) {
		system.android = parseFloat(RegExp.$1);
	}

	// 游戏系统
	system.wii = ua.indexOf('Wii') > -1;
	system.ps = /playstation/i.test(ua);

	return {
		engine: engine,
		browser: browser,
		system: system
	};
})();
