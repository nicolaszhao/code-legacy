
// Depends: utils
var utils = require('utils');

(function(global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(global);
	} else {
		factory(global);
	}
}(window, function(window) {

var $win = $(window),
	$doc = $(document);

var Dialog = function(el, options) {
	this.$el = $(el);
	this.options = $.extend({}, options);
	this._supportFixed = utils.isSupportFixed();
	
	this._create();
};

Dialog.prototype = {
	constructor : Dialog,
	
	_create : function() {
		this.$el.css('position', this._supportFixed ? 'fixed' : 'absolute');
		
		this._shadow();
		this._refresh();
	},
	
	_refresh: function() {
		var that = this;
		
		if (this.options.title) {
			this.$el.find('.dialog-titlebar h2').text(this.options.title);
		}
		
		this.$el.find('.dialog-titlebar-close, .dialog-button-cancel').off('.dialog').on('click.dialog', function(event) {
			event.preventDefault();
			
			if (typeof that.options.cancel === 'function') {
				that.options.cancel.call(that, that.$el);
			}
			
			that.close();
		});
		
		this.$el.find('.dialog-button-ok').off('.dialog').on('click.dialog', function(event) {
			var ret = true;
			
			event.preventDefault();
			
			if (typeof that.options.ok === 'function') {
				ret = that.options.ok.call(that, that.$el);
			}
			
			if (ret === true) {
				that.close();
			}
		});
	},
	
	_shadow: function() {
		this.$shadow = $('<div class="box-shadow">' + 
			'<div class="box-shadow-top">' + 
			'<div class="box-shadow-top-right">' + 
			'<div class="box-shadow-top-center"></div>' + 
			'</div>' + 
			'</div>' + 
			'<div class="box-shadow-center">' + 
			'<div class="box-shadow-center-right box-shadow-content"></div>' + 
			'</div>' + 
			'<div class="box-shadow-bottom">' + 
			'<div class="box-shadow-bottom-right">' + 
			'<div class="box-shadow-bottom-center"></div>' + 
			'</div>' + 
			'</div>' + 
			'</div>')
			
			.appendTo(this.$el);
	},
	
	resize: function() {
		if (this.$el.is(':visible')) {
			this.reposition();
		}
	},
	
	reposition : function() {
		var top;
		
		this.$overlay.css({
			width : Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth),
			height : $doc.height()
		});

		top = (typeof this.options.top !== 'undefined' ? 
				this.options.top : 
				Math.max(($win.height() - this.height) / 2, 0));
		
		this.$el.css({
			top : this._supportFixed ? top : $doc.scrollTop() + top,
			left : ($win.width() - this.width) / 2
		});
	},
	
	option: function(options) {
		this.options = options;
		this._refresh();
	},
	
	zIndex: function() {
		var ret = 999,
			$dialogs = $('.dialog:visible'),
			indexs = [];
		
		if ($dialogs.length) {
			$dialogs.each(function() {
				var index = parseInt($(this).css('zIndex'), 10);
				indexs.push(!isNaN(index) && index !== 0 ? index : ret);
			});
			ret = Math.max.apply(Math, indexs) + 1;
		}
		return ret;
	},
	
	open : function() {
		var that = this,
			width, height;
		
		this.$overlay = $('<div class="dialog-overlay">Dialog Overlay</div>').appendTo('body');
		this.$overlay.css('z-Index', this.zIndex()).on('click.dialog', function() {
			if (typeof that.options.cancel === 'function') {
				that.options.cancel.call(that, that.$el);
			}
			that.close();
		});
		
		this.$el.css({
			'display' : 'block',
			top : -9999,
			left : -9999,
			'z-index': this.zIndex() + 1
		});
		
		this.width = this.$el.width();
		this.height = this.$el.height();
		
		this.$shadow.width(this.width + 14)
			.find('.box-shadow-content').height(this.height - 21); 
			
		if (!this._supportFixed) {
			this.$shadow.width(this.width)
				.find('.box-shadow-content').height(this.height - 35); 
		}
		
		this.$el.css('display', 'none');
		this.reposition();
		
		this.$overlay.fadeIn();
		this.$el.fadeIn();
		
		if (typeof this.options.open === 'function') {
			this.options.open.call(this, this.$el);
		}
	},
	
	close : function() {
		this.$el.fadeOut(200);
		
		if (this.$overlay) {
			this.$overlay.fadeOut(200, function() {
				$(this).off('.dialog').remove();
			});
		}
		
		if (typeof this.options.close === 'function') {
			this.options.close.call(this, this.$el);
		}
	}
};

$.fn.dialog = function(options) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (!Dialog.initialized) {
		$(window).on('resize scroll', function() {
			var $dialog = $('.dialog:visible'),
				inst;
			
			if ($dialog.length && $dialog.data('dialog')) {
				inst = $dialog.data('dialog');
				utils.throttle(inst.resize, inst);
			}
		});
		
		Dialog.initialized = true;
	}
	
	if (typeof options === 'string') {
		this.each(function() {
			var inst = $(this).data('dialog');
			
			if (inst && typeof inst[options] === 'function' && options.charAt(0) !== '_') {
				inst[options].apply(inst, args);
			}
		});
	} else {
		options = $.extend({}, $.fn.dialog.defaults, options);
		this.each(function() {
			var inst = $(this).data('dialog');
			
			if (inst) {
				inst.option(options);
			} else {
				$(this).data('dialog', new Dialog(this, options));
			}
		});
	}
	
	return this;
};

$.fn.dialog.defaults = {
	title: '',
	
	// callbacks
	open: null, 
	close: null, 
	ok: null, 
	cancel: null
};	

window.Dialog = Dialog;

return Dialog;	

}));
