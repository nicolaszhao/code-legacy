/**
 * description: a simple mouse tooltip plugin
 * author: nicolas.z
 * date: Jan 30th, 2013
 * requires: jQuery 1.7+
 */		
(function($) {
	
$.fn.simpletooltip = function() {
	return this.each(function() {
		var $tooltip = $('body > .tooltip').length ? 
				$('body > .tooltip') : 
				$('<div class="tooltip" />').appendTo('body'),
				
			tooltipTimeId, tooltipText;
		
		$(this).on({
			'mouseenter': function() {
				if ($.type($(this).data('title')) === 'undefined') {
					$(this)
						.data('title', $(this).attr('title'))
						.attr('title', '');
				}
			},
			'mousemove': function(e) {
				tooltipText = $(this).data('title');
				
				$tooltip.stop(true, true).fadeOut();
				clearTimeout(tooltipTimeId);
				tooltipTimeId = setTimeout(function() {
					$tooltip
						.html(tooltipText)
						.fadeIn().css({
							position: 'absolute',
							left: e.pageX, 
							top: e.pageY + 25
						});
				}, 250);
			},
			'mouseleave': function() {
				clearTimeout(tooltipTimeId);
				$tooltip.fadeOut();
			}
		});
	});
};
	
})(jQuery);
