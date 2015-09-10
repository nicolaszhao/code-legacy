var $html = $('html'),
	$win = $(window);

var scale = {
	scale: function() {
		var scale = Math.min(1, ($win.height() / 1080));
		this.$el.css('font-size', Math.max(this.minFontSize, 32 * scale));
		
		// fix for ie
		if ($html.hasClass('lte8')) {
			this.$el.find('#container').height(this.$el.height());
		}
	},
	
	events: function() {
		$win.on('resize', _.throttle(_.bind(this.scale, this), 100));
	},
	
	init: function(minFontSize) {
		this.$el = $('body');
		this.minFontSize = minFontSize || 12;
		this.scale();
		this.events();
	}
};

module.exports = scale;
