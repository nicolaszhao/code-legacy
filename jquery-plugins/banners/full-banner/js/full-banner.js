/**
 * jQuery插件：全屏广告
 * create date: 2010-7-29
 * @requires jQuery v1.4.2+
 * @author Nicolas
 */
(function($){
	var mode = document.documentMode || 0;
	var ie6 = $.browser.msie && /MSIE 6.0/.test(navigator.userAgent) && !mode;
	
	$.fn.full = function(o){
		o = $.extend({
			// 播放持续时间，到了设定时间后，广告自动关闭
			// timeout = 0，广告不自动关闭，timeout = 1000，为1秒
			timeout: 0,
			
			// 广告关闭时淡化的过渡时间
			// 1000 = 1秒
			fadeOut: 0,
			
			// 是否启用关闭按钮
			close: true,
			
			// 是否启用重播按钮
			restart: true,
			
			// 重播按钮在浏览器窗口的左右位置
			// 当 container 设置对象后，重播按钮将位于 container 的左或右
			// directionX: "left" or directionX: "right"
			directionX: "left",
			
			// 重播按钮在浏览器窗口的上下位置
			// directionY: "top" or directionY: "bottom"			
			directionY: "top",
			
			// 重播按钮位于浏览器窗口的左或右边缘的间距
			// 当 container 设置对象后，该值为与 container 的边缘间距
			distanceX: 10,
			
			// 重播按钮位于浏览器窗口的上或下边缘的间距
			distanceY: 10,
			
			// z-index
			z: 999,
			
			// 页面主容器
			// example: container: "#main" or container: $("#main")
			container: null,
			
			// 重播按钮需要追加到的特定容器，比如关联广告位
			// example: appendTo: ".b-980x140" or appendTo: $(".b-980x140")
			appendTo: null
		}, o || {});
		
		return this.each(function(){
			var div = $(this), close = $(".full-close", div), restart = $(".full-restart", div);
			var w = div.width(), h = div.height();
			var html = $(".full-banner", div).html();
			
			div.appendTo("body")
			   .css({"width": w, "position": ie6 ? "absolute" : "fixed", "z-index": o.z})
			   .show();
			   
			divPos();
			
			if ($(o.appendTo).length) {
				$(o.appendTo).css("position", "relative")
				             .append(restart.addClass("full-restart-static"));
			}
			else {
				restart.css({"position": ie6 ? "absolute" : "fixed", "z-index": o.z})
					   .appendTo("body");
					   
				restartPos();
			}
			
			autoOff();
			close[o.close ? "show" : "hide"]();
			
			close.click(function(){
				var to = div.data("full-timeout");
				if (to) {
					clearTimeout(to);
					div.removeData("full-timeout");
				}
				closeBanner();
				return false;
			});
			
			restart.click(function(){
				$(this).hide();
				div.find(".full-banner").html(html).end().show();
				autoOff();
				return false;
			});
			
			$(window).bind("resize scroll", function(){
				divPos();
				if (!$(o.appendTo).length) {
					restartPos();
				}
			});
			
			function divPos(){
				var t, l;
				t = ($(window).height() - h) / 2;
				l = ($(window).width() - w) / 2;
				t = ie6 ? $(window).scrollTop() + t : t;
				l = ie6 ? $(window).scrollLeft() + l : l;
				div.css({top: t, left: l});
			}
			function restartPos(){
				var t, l, x = 0;
				var w1 = restart.outerWidth() + o.distanceX, w2;
				if ($(o.container).length) {
					w2 = $(o.container).outerWidth();
					x = ($(window).width() - w2) / 2;
				}
				
				if (o.directionX == "left") {
					l = $(o.container).length ? x - w1 : o.distanceX;
				}
				else {
					if ($(o.container).length) {
						l = x + w2 + o.distanceX;
					}
					else {
						l = $(window).width() - w1;
					}
				}
				
				if (o.directionY == "top") {
					t = o.distanceY;
				}
				else {
					t = $(window).height() - (restart.outerHeight() + o.distanceY);
				}
				
				t = ie6 ? $(window).scrollTop() + t : t;
				l = ie6 ? $(window).scrollLeft() + l : l;
				restart.css({top: t, left: l});
			}
			function autoOff(){
				if (o.timeout) {
					var to = setTimeout(function(){
						closeBanner();
					}, o.timeout);
					div.data("full-timeout", to);
				}
			}
			function closeBanner(){
				div.fadeOut(o.fadeOut);
				restart[o.restart ? "show" : "hide"]();
			}
		});
	};
})(jQuery);
