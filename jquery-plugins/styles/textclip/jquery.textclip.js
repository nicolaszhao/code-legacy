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
	
	clip: function() {
		var lineHeight = this.$elem.css('line-height'), 
			maxHeight, curHeight, len, content, 
			
			_clip = function() {
				content = content.substring(0, --len);
		        curHeight = this.$elem.text(content + this.options.fill).height();
		        
		        if (curHeight > maxHeight) {
		            _clip.call(this);
		        }
			};
			
		if (isNaN(parseFloat(lineHeight))) {
			throw Error('Missing "line-height" property setting.');
		}
		
		maxHeight = (lineHeight.indexOf('px') !== -1 ? 
			Math.ceil(parseFloat(lineHeight)) * this.options.lines :
			Math.ceil(parseFloat(lineHeight) * parseInt(this.$elem.css('font-size'))) * this.options.lines);
			
		if (this.width && this.width === this.$elem.width()) {
			return;
		}
		
		this.width = this.$elem.width();
		this.$elem.text(this.originalContent);
		curHeight = this.$elem.css('height', 'auto').height();
		content = this.originalContent;
		len = content.length;
		
		if (curHeight > maxHeight) {
			_clip.call(this);
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