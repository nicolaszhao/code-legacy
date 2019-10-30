/**
 * description: ajax request state manager
 * author: nicolas.z
 * date: Oct 19th, 2012
 * requires: jQuery 1.4+
 */

(function($) {
	
	var Loader = function($module) {
		var _self = this;

		this._$module = $module;
		this._$loader = $('<div/>')
			.addClass('loader-loading')
			.css('position', 'absolute')
			.appendTo('body')
			.hide();

		this.isVisible = false;
		this.position = null;
	};

	Loader.prototype = {
		constructor: Loader,
		show: function() {
			this.reposition();
			this._$loader.stop(true, true).fadeIn();
			this.isVisible = true;
		},
		hide: function() {
			this._$loader.fadeOut();
			this.isVisible = false;
		},
		reposition: function() {
			var moduleOffset = this._$module.offset();
			
			this.position = {
				width: this._$module.outerWidth(),
				height: this._$module.outerHeight(),
				top: moduleOffset.top,
				left: moduleOffset.left
			};

			this._$loader.css(this.position);
		}
	};

	$.extend({
		loader: function(id) {
			var __loader = arguments.callee;
			
			__loader.loaders = __loader.loaders || {};
			
			var loaders = __loader.loaders,
				loader = id && loaders[id];
				
			if (!loader) {
				loader = {
					_loaderBoxes: {},
					_loaderIndex: 0,
					_xhr: null,
					_display: function(showOrHide) {
						for (var loaderId in this._loaderBoxes) {
							this._loaderBoxes[loaderId][ showOrHide ? 'show' : 'hide' ]();
						}
					},
	
					add: function($modules) {
						var loaderId, _self = this;
	
						$modules.each(function() {
							var $module = $(this);
							
							loaderId = 'loader-' + (++_self._loaderIndex);
							_self._loaderBoxes[loaderId] = new Loader($module);
						});
					},
	
					request: function(url, settings, callback) {
						var _self = this, defaultSettings;
						
						if (typeof settings === 'function') {
							callback = settings;
							settings = undefined;
						}
						
						defaultSettings = {
							type: 'GET',
							dataType: 'json',
							beforeSend: function() {
								_self.show();
							},
							success: function(data, textStatus, jqxhr) {
								if (_self._xhr === jqxhr) {
									callback(data);
								}
							},
							complete: function() {
								_self.hide();
								_self._xhr = null;
							}
						};
						
						$.extend(defaultSettings, settings);
	
						if (_self._xhr) {
							_self._xhr.abort();
						}
						_self._xhr = $.ajax(url, defaultSettings);
					},
	
					show: function() {
						this._display(true);
					},
	
					hide: function() {
						this._display(false);
					}
				};
	
				if (id) {
					loaders[id] = loader;
				}
			}
			
			if (!__loader.initialized) {
				$(window).bind('resize', function() {
					clearTimeout(__loader.timeId);
					__loader.timeId = setTimeout(function() {
						var loaderBoxes, ld;
						
						for (var id in loaders) {
							loaderBoxes = loaders[id]._loaderBoxes;
							for (var loaderId in loaderBoxes) {
								ld = loaderBoxes[loaderId];
								if (ld.isVisible) {
									ld.reposition();
								}
							}
						}
					}, 150);
				});
				
				__loader.initialized = true;
			}
	
			return loader;
		}
	});
})(jQuery); 