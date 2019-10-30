(function($) {
	
var	keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	NUMPAD_ADD: 107,
	NUMPAD_DECIMAL: 110,
	NUMPAD_DIVIDE: 111,
	NUMPAD_ENTER: 108,
	NUMPAD_MULTIPLY: 106,
	NUMPAD_SUBTRACT: 109,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

var increment = 0;

// options
// type: Object
// default: {source: null}
// source: Array
// example: [{label: 'Option Text', value: 'Option Value'}, ...]
var Selectbox = function(target, options) {
	this._target = $(target);
	this._options = $.extend({}, options);
	this._selectedIndex = 0;
	
	this._create();
};

Selectbox.prototype = {
	constructor: Selectbox,
	
	_create: function() {
		var that = this;
		
		this._generateHTML();
		this._button = this._selectbox.find('.selectbox-button');
		this._menu = this._selectbox.find('.selectbox-menu');
		this._target.hide();
		this.refresh();
		
		this._selectbox
			.on('click', 'li', function(event) {
				event.preventDefault();
				
				that._select($(this).index());
				that.hide();
			})
			.on('mouseenter', 'li', function() {
				that._highlight($(this));
			})
			.on('click', '.selectbox-button', function(event) {
				event.preventDefault();
				that[(that._menu.is(':hidden') ? 'show' : 'hide')]();
			})
			.on('keydown', '.selectbox-button', function(event) {
				switch (event.keyCode) {
					case keyCode.DOWN:
						event.preventDefault();
					case keyCode.RIGHT:
						that._change(1);
						break;
					case keyCode.UP:
						event.preventDefault();
					case keyCode.LEFT:
						that._change(-1);
						break;
					case keyCode.ESCAPE:
						if (that._menu.is(':visible')) {
							that.hide();
							event.stopPropagation();
						}
						break;
					case keyCode.ENTER:
						if (that._menu.is(':visible')) {
							that._select(that._menu.find('.selectbox-menu-active').index());
							event.stopPropagation();
						}
						break;
				}
			})
			.on('mousewheel', '.selectbox-menu-items', function(event) {
				event.stopPropagation();
			});
			
		if (!Selectbox._initialized) {
			$(document).on('mousedown', function(event) {
				if (!$(event.target).closest('.selectbox').length) {
					$('.selectbox-menu').hide();
				}
			});
			
			Selectbox._initialized = true;
		}
	},
	
	_generateHTML: function() {
		var	id = 'selectbox-div-' + (++increment);
		
		this._selectbox = $('<div id="' + id + '" class="selectbox">' + 
				'<a href="#" class="selectbox-button" tabindex="0">' +
				'<span class="selectbox-button-icon"><span class="selectbox-button-text"></span></span>' + 
				'</a>' + 
				'<div class="selectbox-menu">' + 
				'<ul class="selectbox-menu-items"></ul>' + 
				'</div>' +
				'</div>')
			.css('position', 'relative');
			
		return this._selectbox;
	},
	
	_change: function(direction) {
		this._selectedIndex += direction;
		if (this._selectedIndex < 0) {
			this._selectedIndex = this._length - 1;
		}
		
		if (this._selectedIndex > this._length - 1) {
			this._selectedIndex = 0;
		}
		
		this._select(this._selectedIndex);
	},

    select : function(index){
        this._update(index);
        this._target.find('option').eq(index).prop('selected', true);
    },
	
	_select: function(index) {
        this.select(index);
		this._target.trigger('change');
	},
	
	_update: function(index) {
		var $li = this._menu.find('li').eq(index);
		
		this._button.find('.selectbox-button-text').text($li.find('a').text());
		this._highlight($li);
		this._selectedIndex = index;
	},
	
	// index: number or jquery object
	_highlight: function(index) {
		var $li = typeof index === 'number' ? this._menu.find('li').eq(index) : index;
		
		this._menu.find('li').removeClass('selectbox-menu-active');
		$li.addClass('selectbox-menu-active');
	},
	
	show: function() {
		var menuHeight;
		
		this._menu.css('display', 'block');
		menuHeight = this._menu.outerHeight();
		
		this._menu.css('top', this._button.outerHeight());
		this._menu.find('.selectbox-menu-items').css('border-width', '0 1px 1px');
		
		if (this._menu.offset().top + menuHeight > $(window).height() &&
				this._button.offset().top - menuHeight > 0) {
					
			this._menu.css('top', -this._menu.outerHeight());
			this._menu.find('.selectbox-menu-items').css('border-width', '1px 1px 0');
		}
		
		// hide all selectbox menu
		$('.selectbox-menu').hide();
		
		this._menu.show();
		
		if (this._menu.is(':visible')) {
			$('.selectbox').css('z-index', 0);
			this._selectbox.css('z-index', 1);
		}
	},
	
	hide: function() {
		this._menu.hide();
	},
	
	refresh: function() {
		var	options = [], 
			items = [],
			data = [],
			width, height, option;
		
		this._selectbox.appendTo('body');
		
		if ($.type(this._options.source) === 'array') {
			$.each(this._options.source, function(i, option) {
				options.push('<option value="' + (option.value ? option.value : option.label) + '">' + option.label + '</option>');
			});
			this._target.empty().append(options.join(''));
		}
		
		for (var i = 0, len = this._target.find('option').length; i < len; i++) {
			option = this._target[0].options[i];
			data.push({
				label: option.text,
				value: option.value ? option.value : option.text
			});
		}
		this._data = data;
		this._length = this._data.length;
		
		for (var i = 0; i < this._length; i++) {
			items.push('<li class="selectbox-menu-item"><a>' + this._data[i].label + '</a></li>');
		}
		this._selectbox.find('.selectbox-menu-items').empty().append(items.join(''));
		
		// 5px is an extra space
		width = this._options.width ? 
			this._options.width : 
			this._menu.css({width: 'auto', display: 'block'}).find('ul').outerWidth() + 5;
			
		this._selectbox.width(width);
		this._menu.width(width);
		
		height = Math.max(24, this._menu.find('.selectbox-menu-item').outerHeight()) * this._options.maxlength;
		this._menu.find('.selectbox-menu-items').css({
			height: 'auto',
			'overflow-y': 'visible',
			'overflow-x': 'visible'
		});
		
		if (this._menu.height() > height) {
			this._menu.find('.selectbox-menu-items')
				.css({
					height: height,
					'overflow-y': 'auto',
					'overflow-x': 'hidden'
				});
		}
		
		this._update(this._target.find('option:selected').index());
		this._target.after(this._selectbox);
		
		this.hide();
	},
	
	option: function(options) {
		if ($.type(options) === 'object' && $.type(options.source) === 'array') {
			this._options.source = options.source;
		}
		
		this.refresh();
	},

    /*
        value 调用 select 的时候不要触发 trigger change
        否则会有冲突问题.
     */
	value: function(value) {
		var index;
			
		value = value + '';
		$.each(this._data, function(i, item) {
			if (item.value === value || item.label === value) {
				index = i;
				return false;
			}
		});
		
		if (typeof index === 'number') {
			this.select(index);
		}
	}
};

$.fn.selectbox = function(options) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (typeof options === 'string') {
		this.each(function() {
			var inst = $(this).data('selectbox');
			
			if (inst && typeof inst[options] === 'function' && options.charAt(0) !== '_') {
				inst[options].apply(inst, args);
			}
		});
	} else {
		options = $.extend({}, $.fn.selectbox.defaults, options);
		this.each(function() {
			var inst = $(this).data('selectbox');
			
			if (inst) {
				inst.option(options);
			} else {
				$(this).data('selectbox', new Selectbox(this, options));
			}
		});
	}
	
	return this;
};

$.fn.selectbox.defaults = {
	
	// Array, e.g. --> [{label: 'Option Text', value: 'Option Value'}, ...]
	source: null,
	width: null,
	maxlength: 15
};

})(jQuery);