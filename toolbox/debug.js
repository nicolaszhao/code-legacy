/*
 * 调试相关
 * date: Sep 13, 2012
 */
var debug = {
	log: function(message) {
		if ( typeof console === 'object') {
			console.log(message);
		} else if ( typeof opera === 'object') {
			opera.postError(message);
		} else if ( typeof java === 'object' && typeof java.lang === 'object') {
			java.lang.System.out.println(message);
		}
	},

	assert: function(condition, message) {
		if (!condition) {
			throw new Error(message);
		}
	},

	/**
	 * 处理时间计算的对象；
	 * 用于JavaScript的性能分析，测试脚本运行的时间；
	 * 返回毫秒为单位的时间差
	 */
	timer: (function() {
		var data = {};

		return {
			start: function(key) {
				data[key] = new Date();
			},

			stop: function(key) {
				var time = data[key];
				if (time) {
					data[key] = new Date() - time;
				}
			},

			getTime: function(key) {
				return data[key];
			}

		};
	})()
}; 