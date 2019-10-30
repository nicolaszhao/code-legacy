var $ = require('jquery'),
	_ = require('underscore'),
	utils = require('utils'),
	Boxshadow = require('jquery-plugins/boxshadow'),
	
	raccount = /^[\w.-]+@$/;

var Suggestion = function(element, options) {
	this.$target = $(element);
	this.options = $.extend({
		source: [],
		of: this.$target,
		
		// callbacks
		select: null
		
	}, options);
	
	this.source = [];
	
	this._create();
};

Suggestion.prototype = {
	constructor: Suggestion,
	
	_create: function() {
		this.$el = $('<ul class="login-suggestion" />').appendTo('body');
		this.$el.boxshadow();
		
		this._events();
	},
	
	_events: function() {
		var keycode = utils.keyCode,
        	that = this;
		
        this.$el.on({
			mouseenter: function() {
				$(this).addClass('login-suggestion-item-active');
			},
			mouseleave: function() {
				$(this).removeClass('login-suggestion-item-active');
			},
			click: function(event) {
				that._select($(this).index());
				return false;
			}
		}, '.login-suggestion-item');
		
		this.$target.on('keydown', function(event) {
			switch (event.keyCode) {
				case keycode.UP:
					that._move(-1);
					break;
				case keycode.DOWN:
					that._move(1);
					break;
				case keycode.ENTER:
					that._select();
					break;
				case keycode.TAB:
					break;
				default:
					setTimeout(function() {
						that._input();
					}, 25);
					break;
			}
		});

        $(document).on('click', function(event) {
            if (!$(event.target).closest('.login-suggestion').length) {
            	that.close();
            }
        });
	},
	
	_input: function() {
		var value = this.$target.val();
		
		if (raccount.test(value)) {
			if (value !== this.term) {
				this.term = value;
				this._renderItems();
			} else {
				this._filter(value);
			}
		} else if (/@/.test(value)) {
			this._filter(value);
		} else {
			this.$el.find('li').hide();
		}
		
		this.$el.css('display', 'block')
			.find('li:visible').length ? this.open() : this.close();
	},
	
	_filter: function(value) {
		var that = this;
		
		_.each(this.source, function(item, index) {
			that.$el.find('li').eq(index).toggle(item.indexOf(value) !== -1);
		});
	},
	
	_renderItems: function() {
		var that = this, 
			prefix = this.term,
			li = [];
		
		if (prefix.length - 1 > 20) {
			prefix = prefix.substring(0, prefix.length - 1);
			prefix = prefix.substring(0, 17) + '...@';
		}
		
		this.source = [];
		_.each(this.options.source, function(item) {
			that.source.push(that.term + item);
			li.push('<li class="login-suggestion-item">' + prefix + item + '</li>');
		});

		this.$el.empty().append(li.join(''));
	},

    _select: function(index) {
    	var value;
    	
    	if (typeof index === 'number') {
    		value = this.$el.find('li').eq(index).text();
    		this.value(value);
    	}
    	
    	this.$target.focus();
    	
    	if ($.type(this.options.select) === 'function') {
			this.options.select.call(this.$target, value);
		}
		
		this.close();
    },
    
	_move: function (direction) {
		if (!this.$el.is(':visible')) {
			return;
		}
		
		var $items = this.$el.find('li:visible'),
			$active = this.$el.find('.login-suggestion-item-active'),
			len = $items.length,
			index = -1;
			
		if ($active.length) {
			index = $active.removeClass('login-suggestion-item-active').index('.login-suggestion-item:visible');
		}
		
		index += direction;
		
		if (index < 0) {
			index = len - 1;
		} else if (index > len - 1) {
			index = 0;
		}
		
		$active = $items.eq(index).addClass('login-suggestion-item-active');
		this.value($active.text());
	},

    value: function(value) {
        this.$target.val(value);
    },
    
	open: function() {
		var $wrapper = $(this.options.of), 
			offset = $wrapper.offset();
		
		this.$el.show()
			.find('li:visible:gt(7)').hide();
		
		this.$el.css({
			left: offset.left,
			top: offset.top + $wrapper.height() + 3,
			width: $wrapper.outerWidth() - 2
		})
			.boxshadow('show');
	},
	
	close: function () {
		this.$el.boxshadow('hide');
        this.$el.hide();
    }
};

$.fn.suggestion = function(options) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (typeof options === 'string') {
		this.each(function() {
			var inst = $(this).data('suggestion');
			
			if (inst && typeof inst[options] === 'function' && options.charAt(0) !== '_') {
				inst[options].apply(inst, args);
			}
		});
	} else {
		options = $.extend({}, $.fn.suggestion.defaults, options);
		this.each(function() {
			var inst = $(this).data('suggestion');
			
			if (!inst) {
				$(this).data('suggestion', new Suggestion(this, options));
			}
		});
	}
	
	return this;
};

$.fn.suggestion.defaults = {};

module.exports = Suggestion;