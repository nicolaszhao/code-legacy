/*! Position plugin - v1.0.0 - 2015-04-18
* Copyright (c) 2015 Nicolas Zhao */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}(function($) {

var $win = $(window),
	$doc = $(document),
	rpos = /^(top|right|bottom|left)([\+\-]\d+)?$/;
        
var isSupportFixed = function() {
	var outer = document.createElement('div'), 
		inner = document.createElement('div'),
		ret = true;

	outer.style.position = 'absolute';
	outer.style.top = '200px';

	inner.style.position = 'fixed';
	inner.style.top = '100px';

	outer.appendChild(inner);
	document.body.appendChild(outer);

	if (inner.getBoundingClientRect && 
			inner.getBoundingClientRect().top === outer.getBoundingClientRect().top) {
		
		ret = false;
	}
	
	document.body.removeChild(outer);
	return ret;
};

var Pos = function(el, options) {
    this.$el = $(el);
    this.options = options;
    this.fixed = isSupportFixed();
    this._size();
    this._analyseOptions();
};

Pos.prototype = {
    constructor: Pos,
    
    _size: function() {
        var $el, sizes;
        
        if (!$doc.find(this.$el).length) {
            $el = this.$el.clone().appendTo('body');
            sizes = {
                width: $el.outerWidth(),
                height: $el.outerHeight()
            };
            $el.remove();
        } else {
            sizes = {
                width: this.$el.outerWidth(),
                height: this.$el.outerHeight()
            };
        }
        
        this.sizes = sizes;
    },
    
    _analyseOptions: function() {
        var my = this.options.my.split(' '),
            at = this.options.at.split(' '),
            of = $(this.options.of),
            myLeft, myTop, myProps, myLeftOffset, myTopOffset, 
            atLeft, atTop, atProps;
            
        myLeft = rpos.exec(my[0]);
        myTop = rpos.exec(my[1]);
        atLeft = at[0];
        atTop = at[1];
        myLeftOffset = myLeft[2] ? parseInt(myLeft[2]) : 0;
        myTopOffset = myTop[2] ? parseInt(myTop[2]) : 0;
        myProps = {
        	left: myLeft[1] === 'left' ? myLeftOffset : -(this.sizes.width + myLeftOffset),
        	top: myTop[1] === 'top' ? myTopOffset : -(this.sizes.height + myTopOffset)
        };
        atProps = {
        	left: atLeft === 'left' ? 0 : of.outerWidth(),
        	top: atTop === 'top' ? 0 : $win.height()
        };
        
        this.my = myProps;
        this.at = atProps;
        this.ofWidth = of.outerWidth();
        this.ofTop = of.offset().top;
        this.$of = of;
        
        this.abs();
        this.pos();
    },
    
    abs: function() {
    	var ofpos;
    	
    	if (!this.fixed) {
        	ofpos = this.$of.css('position');
        	if (!ofpos || 'absolute relative fixed'.indexOf(ofpos) === -1) {
        		this.$of.css('position', 'relative');
        	}
        }
        
        this.$el.css('position', this.fixed ? 'fixed' : 'absolute');
    },
    
    pos: function() {
        var winWidth = $win.width(),
        	scrollLeft = $doc.scrollLeft(),
        	scrollTop = $doc.scrollTop(),
        	space = (winWidth - this.ofWidth) / 2,
        	left = this.my.left + this.at.left,
        	top;
        
        space = space > 0 ? space : (this.fixed ? -scrollLeft : 0);
        
        if (this.fixed) {
        	left = left + space;
        }
        
        if (this.options.collision === 'fit') {
        	if (this.fixed) {
        		if (left < 0) {
		        	left = 0;
		        } else if (left + this.sizes.width > winWidth) {
		        	left = $win.width() - this.sizes.width;
		        }
        	} else {
        		if (left + space < 0) {
        			left = left - (left + space) + scrollLeft;
        		} else if (left + space + this.sizes.width > winWidth) {
        			left = $win.width() - space - this.sizes.width + scrollLeft;
        		}
        	}
        }
        
        if (this.at.top) {
        	this.at.top = $win.height();
        }
        
        top = this.my.top + this.at.top + 
        	(this.fixed ? 0 : scrollTop - this.ofTop);
        
        this.$el.css({
           left: left,
           top: top
        });
    }
};

$.fn.pos = function(settings) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (typeof settings === 'string') {
		this.each(function() {
			var inst = $(this).data('pos');
			
			if (inst && typeof inst[settings] === 'function' && settings.charAt(0) !== '_') {
				inst[settings].apply(inst, args);
			}
		});
	} else {
		settings = $.extend({}, $.fn.pos.defaults, settings);
		this.each(function() {
	    	var $el = $(this),
	       		inst = $el.data('pos');
	       
	       	if (!inst) {
	       		$el.data('pos', new Pos(this, settings));
	       	}
	    });
	}
    
    return this;
};

$.fn.pos.defaults = {
    
    // left|right(+|-px) top|bottom(+|-px)
    my: 'left top',
    
    // left|right top|bottom
    at: 'left top',
    
    // selector, jquery object, element
    of: null,
    
    // fit, none
    collision: 'fit'
};

}));
