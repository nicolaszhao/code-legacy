/**
 * description: a slideshow like the shuffle
 * author: nicolas.z
 * date: Jan 31th, 2013
 * requires: jQuery 1.7+
 * depends: jquery.ui.position.js
 */
(function($) {
	
var getBoxShadow = function(direction) {
	var boxShadow = '6px rgba(000, 000, 000, 0.7)',
		minus = '-',
		hori = '4px ', 
		vert = '4px ', 
		horiOperator = '', 
		vertOperator = '';
	
	if (direction.length === 1) {
		if ('left right'.indexOf(direction[0]) !== -1) {
			vert = '0 ';
			if (direction[0] === 'right') {
				horiOperator = minus;
			}
		} else {
			hori = '0 ';
			if (direction[0] === 'bottom') {
				vertOperator = minus;
			}
		}
	} else {
		if (direction[0] === 'right') {
			horiOperator = minus;
		}
		if (direction[1] === 'bottom') {
			vertOperator = minus;
		}
	}
	
	return (horiOperator + hori) + (vertOperator + vert) + boxShadow;
};

var getMyPosition = function(direction, $item, distance, index) {
	var width = $item.width(),
		height = $item.height();
		
	var getPos = function(pos) {
		var oper = ('left top'.indexOf(pos) !== -1) ? '+' : '-',
			val = ('left right'.indexOf(pos) !== -1) ? width : height;
		
		return pos + oper + (val + (index - 1) * distance);
	};
	
	if (direction.length === 1) {
		return getPos(direction[0]);
	} else {
		return $.map(direction, function(n) {
			return getPos(n);
		}).join(' ');
	}
};

$.fn.shuffle = function(options) {
	options = $.extend({
		items: 'li',
		direction: 'left top',
		distance: 15,
		duration: 400,
		zIndex: 1000,
		easing: null
	}, options);

	return this.each(function() {
		var $container = $(this), 
			$items = $(options.items, $container), 
			len = $items.length, 
			dire = options.direction.split(' '),
			boxShadow = getBoxShadow(dire);
		
		var setPos = function($item, index, using) {
			var i = index,
				dires = $.map(dire, function(n) {
					var operator = (n === 'left' || n === 'top') ? '+' : '-';
					return i ? 
						n + operator + (i * options.distance) :
						n;
				});
			
			$item.position({
				my: dires.join(' '),
				at: options.direction,
				of: $container,
				collision: 'none',
				using: using
			});
			
			return $item;
		};
		
		$items
			.each(function(i) {
				setPos($(this), i)
					.data('index', i)
					.css({
						'z-index': options.zIndex + len - i,
						'box-shadow': boxShadow
					});
			})
			.on('click', function(event) {
				var curIndex = $(this).data('index'), 
					$animItems = $items.filter(function() {
						return $(this).data('index') < curIndex;
					}),
					opts = {
						of: $container,
						collision: 'none',
						using: function(to) {
							$(this).animate(to, options.duration);
						}
					};
					
				if (curIndex === 0) {
					return false;
				}
				
				$(this).data('index', 0);
				$animItems.each(function() {
					$(this).data('index', $(this).data('index') + 1);
				});
				
				$(this)
					.position($.extend(opts, {
						my: getMyPosition(dire, $(this), options.distance, curIndex),
						at: options.direction
					}))
					.promise().done(function() {
						$items.each(function() {
							var index = $(this).data('index');
							$(this).css('z-index', options.zIndex + len - index);
						});
						$animItems.each(function() {
							setPos($(this), $(this).data('index'), opts.using);
						});
						
						$(this).position($.extend(opts, {
							my: options.direction,
							at: options.direction
						}));
					});
				
				event.preventDefault();
			});
	});
};

})(jQuery);
