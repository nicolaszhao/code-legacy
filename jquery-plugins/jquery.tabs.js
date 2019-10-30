/*! Tabs plugin - v1.0.0 - 2015-04-24
* Copyright (c) 2015 Nicolas Zhao */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}(function($) {

var rhash = /^[^#]*#(.+)$/;

var Tabs = function(el, options) {
	this.$el = $(el);
	this.$tabs = this.$el.find('.tabs-nav');
	this.$panels = this.$el.find('.tabs-panel');
	this.options = $.extend({}, options);
	
	this.index = -1;
	this.create();
};

Tabs.prototype = {
	constructor: Tabs,
	
	create: function() {
		var that = this;
		
		this.$tabs.find('li').each(function() {
			var $el = $(this),
				id = $el.find('a').attr('href'),
				match = rhash.exec(id);
			
			if (match && match[1]) {
				$el.data('tabs-panel-id', match[1]);
			}
		});
		
		this.active(typeof this.options.index === 'number' ? this.options.index : 0);
		this.events();
	},
	
	active: function(index) {
		var $activeTab, id;
		
		if (index === this.index) {
			return;
		}
		
		this.index = index;
		
		$activeTab = this.$tabs.find('li').removeClass('tabs-active')
			.eq(index).addClass('tabs-active');
			
		id = $activeTab.data('tabs-panel-id');
		this.$panels.hide().filter('#' + id).show();
	},
	
	events: function() {
		var that = this;
		
		this.$el.on('click', 'li', function() {
			that.active($(this).index());
			return false;
		});
	}
};

$.fn.tabs = function(settings) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (typeof settings === 'string') {
		this.each(function() {
			var inst = $(this).data('tabs');
			
			if (inst && typeof inst[settings] === 'function' && settings.charAt(0) !== '_') {
				inst[settings].apply(inst, args);
			}
		});
	} else {
		settings = $.extend({}, $.fn.tabs.defaults, settings);
		this.each(function() {
	    	var $el = $(this),
	       		inst = $el.data('tabs');
	       
	       	if (!inst) {
	       		$el.data('tabs', new Tabs(this, settings));
	       	}
	    });
	}
    
    return this;
};

$.fn.tabs.defaults = {
    index: 0
};

}));