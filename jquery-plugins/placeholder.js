var $ = require('jquery'),
	increment = 0;

var Placeholder = function(target) {
    var input = document.createElement('input');

    if ('placeholder' in input || !$(target).attr('placeholder')) {
        input = null;
        return;
    }
    input = null;

    this._element = $(target);
    this._placeholderText = this._element.attr('placeholder');
    
    this._create();
};

Placeholder.prototype = {
    constructor: Placeholder,
    
    _create: function() {
        var that = this,
            id = 'placeholder-div-' + (++increment);

        
		this._placeholder = $('<div id="' + id + '" class="placeholder" />').css({
				color : '#aaa',
				position : 'absolute'
			})
			.text(this._placeholderText)
			.on('click', function() {
	            that._element.focus();
	        })
			.insertAfter(this._element); 

        this._element.parent().css('position', 'relative').end()
	        .on('keydown change focus blur', $.proxy(this._check, this));
	    
	    this._check();
    },
    
    _check: function() {
    	var that = this;
    	
    	clearTimeout(this._timer);
        this._timer = setTimeout(function () {
            that._placeholder.toggle((that._element.is(':visible') && that._element.val() === ''));
    		that._reposition();
        }, 50);
    },
    
    _reposition: function() {
    	if (!this._placeholder.is(':visible')) {
    		return;
    	}
    	
    	var height = this._element.outerHeight(),
            pos = this._element.position();
            
    	this._placeholder.css({
    		top : pos.top,
			left : pos.left + parseInt(this._element.css('padding-left')),
			height : height,
			'line-height' : height + 'px'
    	});
    }
};

$.fn.placeholder = function() {
	return this.each(function() {
		var inst = $(this).data('placeholder');
		
		if (!inst) {
			$(this).data('placeholder', new Placeholder(this));
		}
	});
};

module.exports = Placeholder;