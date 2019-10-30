var jQuery = require('common/jquery');

(function($) {

// options: {
//	lines: 1,
//	fill: '...'
// }	
var TextClip = function(target, options) {
	this.$elem = $(target);
	this.options = $.extend({}, $.fn.textclip.defaults, options);
	this.originalContent = this.$elem.text();
	
	this.create();
};

TextClip.prototype = {
	constructor: TextClip,
	
	create: function() {
		var textClips = $('body').data('textClips');
		
		this.clip();
		textClips = textClips || [];
		textClips.push(this);
		$('body').data('textClips', textClips);
		
		if (!TextClip._initialized) {
			TextClip._initialized = true;
			
			$(window).on('resize', function() {
				clearTimeout(TextClip._resizeTimer);
				TextClip._resizeTimer = setTimeout(function() {
					var textClips = $('body').data('textClips');
					
					if ($.type(textClips) === 'array' && textClips.length) {
						$.each(textClips, function(i, textClip) {
							textClip.clip();
						});
					}
				}, 50);
			});
		}
	},
	
	splitText: function(content, curHeight, maxHeight) {
		var start = 0, 
			end = content.length, 
			middle;
			
		while (curHeight > maxHeight || maxHeight - curHeight >= this.lineHeight) {
			middle = Math.ceil((end - start) / 2) + start;
			curHeight = this.$elem.text(content.substring(0, middle)).height();
			
			if (curHeight > maxHeight) {
				end = middle;
			} else {
				start = middle;
			}
		}
		
		return content.substring(0, middle);
	},
	
	clip: function() {
		var lineHeight = this.$elem.css('line-height'), 
			maxHeight, curHeight, content;
			
		if (isNaN(parseFloat(lineHeight))) {
			throw Error('Missing "line-height" property setting.');
		}
		
		maxHeight = (lineHeight.indexOf('px') !== -1 ? 
			Math.ceil(parseFloat(lineHeight)) * this.options.lines :
			Math.ceil(parseFloat(lineHeight) * parseInt(this.$elem.css('font-size'))) * this.options.lines);
			
		this.lineHeight = maxHeight / this.options.lines;
			
		if (this.width && this.width === this.$elem.width()) {
			return;
		}
		
		this.width = this.$elem.width();
		this.$elem.text(this.originalContent);
		curHeight = this.$elem.css('height', 'auto').height();
		
		if (curHeight > maxHeight) {
			content = this.splitText(this.originalContent, curHeight, maxHeight);
			this.$elem.text(content.substring(0, content.length - 3) + '...');
		}
	}
};

TextClip.destroy = function() {
	$('body').removeData('textClips');
};

$.fn.textclip = function(options) {
	options = $.extend({}, $.fn.textclip.defaults, options);
	
	return this.each(function() {
		new TextClip(this, options);
	});
};

$.fn.textclip.defaults = {
	lines: 1,
	fill: '...'
};

$.extend({
	textclip: {
		destroy: TextClip.destroy
	}
});
	
if (typeof module === 'object' && module && typeof module.exports === 'object') {
	module.exports = TextClip;
} else {
	window.TextClip = TextClip;

	if (typeof define === 'function' && define.amd) {
		define('TextClip', [], function () { return TextClip; });
	}
}

})(jQuery);