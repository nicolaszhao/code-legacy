/**
 * jQuery图片库插件
 * 当前图片（中间）突出显示较大尺寸，点击左右滚动时，以动画方式缩放图片尺寸；
 * 画廊区域只显示3张图片，中间图片尺寸较大。
 * create date: 2010-5-14
 * @requires jQuery v1.4.2+
 * @author Nicolas
 */
(function($){
	$.fn.gallery = function(o){
		o = $.extend({
			btnPrev: null,
			btnNext: null,
			speed: 200,
			circular: false,
			// 中间较大尺寸图片的宽度
			biggerWidth: null
		}, o);
		return this.each(function(){
			var div = $(this), ul = $("ul", div), li = $("li", ul), len = li.size();
			var normal = li.width(), outer = li.outerWidth(), large = o.biggerWidth;
			var curr = 1;
			// ul向左偏移的初始值
			var left = -(large - normal) / 2;
			// 循环播放时复制部分li到ul的前后以实现循环显示
			if (o.circular) {
				ul.prepend(li.slice(len - 3).clone()).append(li.slice(0, 3).clone());
				li = $("li", ul), len = li.size();
				curr = 4;
			}
			
			div.css({
				width: outer * 3,
				position: "relative",
				overflow: "hidden"
			});
			ul.css({
				width: outer * (len - 1) + large + (outer - normal),
				position: "relative",
				left: (-(curr - 1) * outer) + left
			});
			li.eq(curr).width(o.biggerWidth).find("img").width(o.biggerWidth);
			
			if (o.btnPrev) {
				$(o.btnPrev).click(function(){
					return go(curr - 1, "left");
				});
			}
			if (o.btnNext) {
				$(o.btnNext).click(function(){
					return go(curr + 1, "right");
				});
			}
			
			var running = false;
			function go(to, direction){
				if (!running) {
					curr = to;
					
					if (o.circular) {
						// 因为是使用left实现循环显示，需要将看不到的元素li设置为初始状态
						if (to <= 0) {
							ul.css("left", -((len - 6) * outer) + left);
							curr = len - 6;
							li.eq(1).width(normal).find("img").width(normal);
							li.eq(curr + 1).width(large).find("img").width(large);
						}
						else 
							if (to >= len - 1) {
								ul.css("left", -(3 * outer) + left);
								curr = 5;
								li.eq(len - 2).width(normal).find("img").width(normal);
								li.eq(curr - 1).width(large).find("img").width(large);
							}
					}
					else {
						if (to >= len || to < 0) {
							return false;
						}
					}
					
					var prev = (direction == "right") ? curr - 1 : curr + 1;
					// 缩小当前的大图
					li.eq(prev).animate({
						"width": normal
					}, o.speed).find("img").animate({
						"width": normal
					}, o.speed);
					
					// 放大要转到中间的图
					li.eq(curr).animate({
						"width": large
					}, o.speed).find("img").animate({
						"width": large
					}, o.speed);
					
					// 动画更改ul的左偏移
					ul.animate({
						"left": (-((curr - 1) * outer) + left) + "px"
					}, o.speed, function(){
						running = false;
					});
				}
				return false;
			}
		});
	};
})(jQuery);
