
// Depends: request
var Request = require('request');

(function(global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(global);
	} else {
		factory(global);
	}
}(window, function(window) {
	
var req = Request();
	
var brApi = {
	isBDBrowser: (function() {
		var rbdbrowser = /BIDUBrowser(?:\/|\s)(\d)/i,
			match = rbdbrowser.exec(navigator.userAgent);
		
		if (match && match[1] < 7) {
			return false;
		}
		
		return (match && match[1] >= 7) || (typeof window.external !== 'undefined' && 
				typeof window.external.GetNextReqID !== 'undefined' && 
				typeof window.external.StartRequest !== 'undefined');
	}()),
	
	getVersion: function() {
		var defer = $.Deferred();
		
		req.post('get_browser_version', function(cmd, data) {
			if (data.error === 0) {
				defer.resolve(data.body.ver);
			}
		}); 
		
		return defer.promise();
	},
	
	report: function(data) {
		req.post('data_report', data);
	},
	
	getChannelId: function() {
		var defer = $.Deferred(),
			sid;
		
		req.post('get_channel_info', function(cmd, data) {
			if (data.error === 0) {
				sid = data.body['newtab_baidu_search_tn'].substring(0, 8);
				defer.resolve(sid);
			}
		}); 
		
		return defer.promise();
	},
	
	openUrl: function(url) {
		req.post('open_url', ['offside', url]);
	},
	
	openLoginDialog: function() {
		req.post('account_login_dialog', ['bdbrowser://login']);
	},
	
	logoutAccount: function() {
		req.post('account_logout');
	},
	
	getAccount: function() {
		var defer = $.Deferred();
		
		req.post('account_get_userinfo', function(cmd, res) {
            if (res.error === 0) {
            	defer.resolve(res.body);
            }
        });
        
        return defer.promise();
	},
	
	listenAccount: function(callback) {
		req.post('on_user_switched.addListener', function() {
			typeof callback === 'function' ? callback() : location.reload(true);
		});
	},
	
	ajax: function(conf) {
		conf = $.extend({
			charsetFrom: 'utf-8',
			charsetTo: 'utf-8',
			browserCookie: true,
			headers: [],
			data: '',
			dataType: 'text',
			type: 'get',
			success: $.noop,
			error: $.noop,
			complete: $.noop,
			timeout: 0
		}, conf);
		
		conf.type = conf.type.toLowerCase();
		
		var defer = $.Deferred(), 
			isTimeout = false, 
			postData = '',
			url, timeoutTimer, 
			
			parseHeaders = function(headers) {
				var arr = headers.split(/\r\n/),
					map = {};
					
				$.each(arr, function(i, line) {
					var field = line.split(/:\s*/);
					if (field.length == 2) {
						map[field[0]] = field[1];
					}
				});
				
				return map;
			},
		
			transData = function(data) {
				return typeof data == 'object' ? $.param(data) : (data + '');
			},
			
			attachUrl = function(url, data) {
				if (/\?$/.test(url) || (/\?/.test(url) && /&$/.test(url))) {
					url += data;
				} else if (/\?/.test(url)) {
					url += '&' + data;
				} else {
					url += '?' + data;
				}
				
				return url;
			};
		
		if (conf.type === 'post') {
			url = conf.url;
			postData = transData(conf.data);
		} else {
			url = attachUrl(conf.url, transData(conf.data));
		}

		if (conf.timeout !== 0) {
			timeoutTimer = setTimeout(function() {
				isTimeout = true;
				conf.error({}, 0, 'timeout');
				
				defer.reject({}, 0, 'timeout');
			}, conf.timeout);
		}
		
		req.post('http_request', [url, conf.charsetFrom, conf.charsetTo, {
			method: conf.type,
			browser_cookie: conf.browserCookie,
			headers: conf.headers,
			post_data: postData
		}], function(cmd, res) {
			var headers = {}, 
				status = 0, 
				body = null, 
				data = null, 
				ajaxSuccess = true;

			clearTimeout(timeoutTimer);

			if (isTimeout) {
				return;
			}

			if (res.error === 0 && res.body) {
				body = res.body;
				status = body.status_code;
				headers = parseHeaders(body.response_head);
				data = body.response_body;

				if (status >= 200 && status < 300) {
					if (conf.dataType == 'json') {
						try {
							data = JSON.parse(data);
						} catch (e) {
							ajaxSuccess = false;
							status = 'parse error';
						}
					}
				} else {
					ajaxSuccess = false;
				}
			} else {
				ajaxSuccess = false;
			}

			if (ajaxSuccess) {
				conf.success(data, headers, status);
				defer.resolve(data, headers, status);
			} else {
				conf.error(headers, status);
				defer.reject(headers, status);
			}

			conf.complete(data, headers, status);
		});

		return defer.promise();
	},
	
	encrypt: function(input) {
		var defer = $.Deferred(),
			postTimer;
			
		input = (input ? input : +(new Date()) + '');
		
		postTimer = setTimeout(function() {
			defer.reject();
		}, 2000);
		
		req.post('encrypt_string_ex', [1, 'BDWXb622d42018f7a3b3e60dc805d3084ee5', input], function(cmd, res) {
			var data;
			
			clearTimeout(postTimer);
			
			if (res.error === 0) {
				data = res.body;
				defer.resolve({
					guid: data.guid,
					
					// 加密前的字符串
					instr: input,
					
					// 加密后的字符串
					cistr: data.encrypt_str
				});
			}
		});
		
		return defer.promise();
	},
	
	getZeusVersion: function(cmdId) {
		var defer = $.Deferred(),
			params = [{sub_requests : [{cmd : cmdId}]}];
		
		req.post('zeus_protocol_request', params, function(cmd, data) {
			var configs, ret;
			
			if (data.error === 0) {
				if (data.body.action_map.length) {
					configs = data.body.action_map[0].actions[0].kv_configs[0].configs;
					$.each(configs, function(i, config) {
						if (config.key === 'ver') {
							ret = config.value;
							return false;
						}
					});
					defer.resolve(ret.toLowerCase());
				} else {
					defer.reject();
				}
			} else {
				defer.reject();
			}
		});
		
		return defer.promise();
	}
};	

window.brApi = brApi;
	
return brApi;

}));
