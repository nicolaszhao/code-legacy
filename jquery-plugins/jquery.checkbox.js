(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	
/*
 * html struct
 * <label>
 * <span class="checkbox"><input type="checkbox"></span>label text
 * </label>
 * 
 * classes
 * .checkbox
 * .checkbox-state-checked
 * .checkbox-state-disabled
 */
var CheckBox = function(el, options) {
	this.$el = $(el);
	this.options = options;
	this._create();
};

CheckBox.prototype = {
	constructor: CheckBox,
	
	_create: function() {
		var that = this;
		
		this._render();
		
		this.$el.on('click', function() {
			var $el = $(this),
				checked = $el.prop('checked');
			
			that.checked(checked);
				
			if (typeof that.options.change === 'function') {
				that.options.change.apply(that.$el, [checked]);
			}
		});
	},
	
	_render: function() {
		var checked = this.$el.prop('checked'),
			disabled = this.$el.prop('disabled');
			
		this.$el.wrap('<span class="checkbox"></span>')
			.closest('label').addClass('checkbox-label');
		
		this.checked(checked);
		this.disabled(disabled);
	},
	
	checked: function(checked) {
		this.$el
			.prop('checked', checked)
			.parent('.checkbox').toggleClass('checkbox-state-checked', checked);
	},
	
	disabled: function(disabled) {
		this.$el
			.prop('disabled', disabled)
			.parent('.checkbox').toggleClass('checkbox-state-disabled', disabled)
			.closest('.checkbox-label').toggleClass('checkbox-label-state-disabled', disabled);
	}
};

$.fn.checkbox = function(settings) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (typeof settings === 'string') {
		this.each(function() {
			var inst = $(this).data('checkbox');
			
			if (inst && typeof inst[settings] === 'function' && settings.charAt(0) !== '_') {
				inst[settings].apply(inst, args);
			}
		});
	} else {
		settings = $.extend({}, $.fn.checkbox.defaults, settings);
		this.each(function() {
	    	var $el = $(this),
	       		inst = $el.data('checkbox');
	       
	       	if (!inst) {
	       		$el.data('checkbox', new CheckBox(this, settings));
	       	}
	    });
	}
    
    return this;
};

$.fn.checkbox.defaults = {
	change: null
};

}));