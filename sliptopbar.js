var _ = require('underscore'),
	slipblock = require('app/slipblock'),
	fixie = require('app/fixie'),
	$win = $(window),
	$con = $('#content');
	
var sliptopbar = (function() {
	var $header = $('#header'),
		height = $header.height(),
		state;
	
	var _getState = function() {
		return $con.scrollTop() > 150 ? 'hidden' : 'visible';
	};
	
	var _getTop = function() {
		return state === 'hidden' ? -height : 0;
	};
	
	var _toggle = function() {
		$header.finish().animate({top: _getTop()})
			.find('.header-tip')[state === 'hidden' ? 'fadeOut' : 'fadeIn']();
	};
	
	state = _getState();
	_toggle();
	
	return {
		slip: function() {
			var _state = _getState();
			
			if (state && state !== _state) {
				state = _state;
				_toggle();
			}
		}
	};
})();

fixie.start();
slipblock.start();

$('#nav')
	.on('mouseenter', 'li', function() {
		slipblock.move($(this));
	})
	.on('mouseleave', function() {
		slipblock.back();
	});
	
$('.button-download-70-qiang').on('click', function() {
	if (window._hmt) {
        _hmt.push(['_trackEvent', '7.0 疯抢版下载按钮', '下载', '下载']);
    }
});

$('.button-download-70-parents').on('click', function() {
	if (window._hmt) {
        _hmt.push(['_trackEvent', '7.0 爸妈版下载按钮', '下载', '下载']);
    }
});

$('.button-download-65-standard').on('click', function() {
	if (window._hmt) {
        _hmt.push(['_trackEvent', '6.5 标准版下载按钮', '下载', '下载']);
    }
});

$('.button-download-65-7k7k').on('click', function() {
	if (window._hmt) {
        _hmt.push(['_trackEvent', '6.5 7K7K游戏版下载按钮', '下载', '下载']);
    }
});

$con.on('scroll', _.throttle(sliptopbar.slip, 100));
