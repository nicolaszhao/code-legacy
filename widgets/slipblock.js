var $win = $(window);

var Slipblock = function(el) {
	var $el = $(el),
		$block = $el.siblings('.nav-highlight'),
		$menus = $el.find('li'),
		id = $('body').attr('id'),
		$activeMenu, props, startTimer, backTimer;
	
	var start = function() {
		$activeMenu = $menus.filter('.nav-' + id);
		if ($activeMenu.length) {
			props = pos($activeMenu);
		} else {
			props = {width: 60, left: -60};
		}
		
		$block.css(props);
	};
	
	var pos = function($menu) {
		var navLeftDistance = 15,
			menuWidth = $menu.outerWidth(),
			homeMenuWidth = $el.find('.nav-home').outerWidth(),
			width = $menu.is('.nav-home') ? 25 : 60,
			index = $menu.index() - 1,
			menuLeft;
			
		index = index < 0 ? 0 : index;
		menuLeft = $menu.is('.nav-home') ? 0 : (homeMenuWidth + index * menuWidth);
		 
		return {
			width: width, 
			
			// 导航左侧的空间  + 当前菜单右侧菜单项的宽度 + 当前菜单文字左侧的空间
			left: navLeftDistance + menuLeft + ((menuWidth - width) / 2)
		};
	};
	
	var move = function($menu) {
		clearTimeout(backTimer);
		clearTimeout(startTimer);
		startTimer = setTimeout(function() {
			$block.finish().animate(pos($menu), 400);
		}, 200);
	};
		
	var back = function() {
		clearTimeout(startTimer);
		backTimer = setTimeout(function() {
			$block.animate(props, 400);
		}, 200);
	};
	
	var events = function() {
		$el
			.on('mouseenter', 'li', function() {
				move($(this));
			})
			.on('mouseleave', function() {
				back();
			});
			
		$win.on('resize', _.throttle(start, 100));
	};
	
	return {
		start: function() {
			start();
			events();
		}
	};
};

module.exports = Slipblock;
