/**
 * jquery实现position: fixed插件
 * create date: 2010-05-26
 * @requires jQuery v1.4.2+
 * @author Nicolas
 */
(function($){
	$.fn.fixed = function(o){
		o = $.extend(true, {
			direction: {
				// left, right
				x: "left",
				// top, bottom
				y: "top"
			},
			distance: {
				x: 5,
				y: 5
			},
			z: 99
		}, o);
		
		return this.each(function(){
			var div = $(this);
			div.css("z-index", o.z);
			if ($.browser.msie && $.browser.version == "6.0") {
				
				var position = function(){
					return {
						left: o.direction.x == "left" ? o.distance.x : $(window).width() - div.outerWidth() - o.distance.x,
						top: o.direction.y == "top" ? o.distance.y : $(window).height() - div.outerHeight() - o.distance.y
					};
				};
				
				div.css({
					position: "absolute",
					top: position().top,
					left: position().left
				});
				
				$(window).bind("resize scroll", function(){
					div.css({
						top: $(window).scrollTop() + position().top,
						left: $(window).scrollLeft() + position().left
					});
				});
			}
			else {
				div.css("position", "fixed").css(o.direction.x, o.distance.x).css(o.direction.y, o.distance.y);
			}
		});
	};
})(jQuery);
