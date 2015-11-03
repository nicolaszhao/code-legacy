var XHRService = function(options) {
	this.options = options;
	this.reqTimer = null;
};

XHRService.prototype = {
	constructor: XHRService,

	req: function(options) {
		var that = this,
			defer = $.Deferred();

		clearTimeout(this.reqTimer);
		this.reqTimer = setTimeout(function() {
			that._req(options, defer);
		}, this.options.reqDelay);

		return defer.promise();
	},

	_req: function(options, defer) {
		var that = this;

		if (this.xhr) {
			this.xhr.abort();
		}

		if (typeof this.options.before === 'function') {
			clearTimeout(this.loadingTimer);
			this.loadingTimer = setTimeout(function() {
				that.options.before();
			}, this.options.loadingDelay);
		}

		this.xhr = $.ajax(options)
			.done(function(data) {
				defer.resolve(data);
			})
			.always(function(res, status, xhrObj) {
				clearTimeout(that.loadingTimer);

				if (typeof that.options.after === 'function') {
					that.options.after();
				}

				if (xhrObj === that.xhr) {
					that.xhr = null;
				}
			});
	}
};

// how to use:
/*
var xhr = new XHRService({
	reqDelay: 50,
	loadingDelay: 20,
	before: function() {
		console.log('show loading...');
	},
	after: function() {
		// console.log('hide loading...');
	}
});

var autoReq = function(delay) {
	var timer = null, count = 0;
	timer = setTimeout(function() {
		xhr.req({
			url: 'http://n.cn:8080/angular-phonecat/app/phones/motorola-xoom.json',
			dataType: 'json'
		}).done(function(data) {
			console.log('done!');
		});

		if (++count < 10) {
			timer = setTimeout(arguments.callee, delay);
		}
	}, delay);
};

autoReq(10);
	*/