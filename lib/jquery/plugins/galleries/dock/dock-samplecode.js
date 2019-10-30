var _ = require('underscore'),
	keycode = require('keycode'),
	slipblock = require('app/slipblock'),
	sid = require('app/sid'),
	packageinfo = require('app/packageinfo'),
	download = require('app/download'),
	fixie = require('app/fixie'),
	$win = $(window),
	
	cssanimations = Modernizr.cssanimations;
	
require('jquery-plugins/jquery.jqDock');

var delay = function(delay) {
	return $.Deferred(function(defer) {
		setTimeout(defer.resolve, delay);
	});
};

var ready = function(callback) {
	delay(350).done(function() {
		callback();
	});
};

var emScale = (function() {
	var $stages = $('#stages');
	
	var _resize = function() {
		var scale = Math.min(1, (Math.max(450, $win.height()) / 1080));
		
		$stages.css('font-size', 32 * scale);
	};
	
	return {
		start: function() {
			_resize();
			$win.on('resize', _.throttle(_resize, 100));
		}
	};
})();

var stage4IconTip = (function() {
	var $iconsWrapper = $('.stage-4-icon-wrapper'),
		source = [];
	
	var _html = function(data) {
		return '<span class="stage-4-icon-tip tip tip-top">' + 
			'<a class="tip-text" href="' + data.url + '" target="_blank" ><span class="tip-icon"></span>' + data.text + '</a>' + 
			'<span class="tip-arrow"></span>' + 
			'</span>';
	};
	
	return {
		create: function() {
			$.each(source, function(index, item) {
				var $icon = $iconsWrapper.find('.stage-4-icon-item[data-index="' + item.index + '"]')
						.append(_html(item));
				
				$icon.find('.stage-4-icon-tip').on('mouseenter.stage4-tip', function() {
					stage4.icons().jqdock('idle');
				}).on('mouseleave.stage4-tip', function() {
					stage4.icons().jqdock('nudge');
				});
					
				if (!item.url) {
					$icon.find('.tip-text').on('click', function() {
						return false;
					});
				}
				
				if (item.className) {
					$icon.find('.tip').addClass(item.className);
				}
			});
		},
		
		remove: function() {
			$('.stage-4-icon-tip').off('.stage4-tip');
			$('.stage-4-icon-tip').remove();
		},
		
		// data: [{index: 0, text: '', url: ''}, ...]
		setSource: function(data) {
			source = data;
		}
	};
})();

var stage4 = (function() {
	var $wrapper = $('.stage-4-icon-wrapper'),
		$title = $('.stage-4-title li'),
		$descs = $('.stage-4-description li'),
		originStruct = $wrapper.html(),
		defaultIndex = 8,
		respond, size;
	
	var _changeInfo = function(index) {
		$title.finish().fadeOut().eq(index).fadeIn();
		$descs.finish().fadeOut().eq(index).fadeIn();
	};
	
	var _getRespond = function() {
		var _respond;
		
		if ($win.height() > 870) {
			size = 120;
			_respond = 'large';
		} else {
			size = 80;
			_respond = 'mini';
		}
		
		return _respond;
	};
	
	var _resize = function() {
		var _respond = _getRespond();
		
		if (respond && respond !== _respond) {
			$wrapper.css('visibility', 'hidden');
			
			stage4IconTip.remove();
			$wrapper.find('.stage-4-icon').jqdock('destroy');
			$wrapper.html(originStruct).find('.stage-4-icon').jqdock({
				size: size,
				sizeMax: size * 2,
				distance: size * 3,
				flow: '.stage-4-icon'
			});
			
			delay(500).done(function() {
				$wrapper.css('visibility', 'visible');
			});
			
			delay(cssanimations ? 2600 : 500).done(function() {
				stage4IconTip.create();
			});
			
			respond = _respond;
		}
	};
	
	return {
		start: function() {
			if ($('html').hasClass('ie6')) {
				$('.stage-4-icon-item img').attr('src', function(index, attr) {
					return $(this).data('src');
				});
			}
			
			respond = _getRespond();
			$wrapper.find('.stage-4-icon').jqdock({
				size: size,
				sizeMax: size * 2,
				distance: size * 3,
				flow: '.stage-4-icon',
				onReady: function() {
					$wrapper.css('visibility', 'visible');
				}
			});
			
			_changeInfo(defaultIndex);
			$win.on('resize', _.throttle(_resize, 100));
		},
		
		bindEvents: function() {
			$wrapper.find('.stage-4-icon')
				.on('mouseenter.stage4', '.jqDockItem ', function() {
					_changeInfo($(this).index());
				})
				.on('mouseleave.stage4', function() {
					_changeInfo(defaultIndex);
				});
		},
		
		offEvents: function() {
			$wrapper.find('.stage-4-icon').off('.stage4');
		},
		
		icons: function() {
			return $wrapper.find('.stage-4-icon');
		}
	};
})();

var slideForIE = (function() {
	var $stage = $('.stage');
	
	if (!cssanimations) {
		$stage.not('#stage-1').css('top', '100%');
	}
	
	return {
		next: function($current, $target) {
			if (!cssanimations) {
				$stage.finish();
				$current.animate({top: '-100%'});
				$target.animate({top: 0});
			}
		},
		
		prev: function($current, $target) {
			if (!cssanimations) {
				$stage.finish();
				$current.animate({top: '100%'});
				$target.animate({top: 0});
			}
		}
	};
})();

var slide = (function() {
	var $stage = $('.stage'),
		len = $stage.length,
		index = 0,
		running = false,
		freezeTime = 1000,
		autoRun = false,
		runTimer, autoTimer;
	
	var _activateSlidebar = function() {
		$('#slidebar').find('li').removeClass('slidebar-active')
			.eq(index).addClass('slidebar-active');
	};
	
	var _run = function() {
		running = true;
		clearTimeout(runTimer);
		runTimer = setTimeout(function() {
			running = false;
		}, freezeTime);
	};
	
	var _changeNextButton = function() {
		$('.button-next')[index === len - 1 ? 'fadeOut' : 'fadeIn']()
			.find('.button-next-text')[index === 0 ? 'fadeIn' : 'fadeOut']();
	};
	
	var _nudgeStage4Icons = function($target) {
		if ($target.is('#stage-4')) {
			stage4.icons().jqdock('idle');
			delay(cssanimations ? 3000 : 300).done(function() {
				stage4.icons().jqdock('nudge');
				stage4.bindEvents();
				stage4IconTip.create();
			});
		}
	};
	
	var _freezeStage4Icons = function($target) {
		if ($target.is('#stage-4')) {
			stage4IconTip.remove();
			stage4.icons().jqdock('idle');
			stage4.offEvents();
		}
	};
	
	var _clearAuto = function() {
		clearTimeout(autoTimer);
	};
	
	return {
		start: function() {
			_run();
		},
		
		next: function() {
			var $current, $target;
			
			if (index + 1 > len - 1 || running) {
				return;
			}
			
			_clearAuto();
			
			if (index === 0) {
				$current = $stage.eq(index).addClass('stage-state-in');
				delay(100).done(function() {
					$current.addClass('stage-state-out');
				});
			} else {
				$current = $stage.eq(index).addClass('stage-state-out');
			}
			$target = $stage.eq(++index).addClass('stage-state-in');
			
			slideForIE.next($current, $target);
			
			_nudgeStage4Icons($stage.eq(index));
			_changeNextButton();
			_activateSlidebar();
			_run();
		},
		
		prev: function() {
			var $current, $target;
			
			if (index - 1 < 0 || running) {
				return;
			}
			
			_clearAuto();
			_freezeStage4Icons($stage.eq(index));
			
			$current = $stage.eq(index).removeClass('stage-state-in stage-state-out-in');
			$target = $stage.eq(--index).addClass('stage-state-out-in').removeClass('stage-state-out');
			
			slideForIE.prev($current, $target);
			
			_run();
			_changeNextButton();
			_activateSlidebar();
		},
		
		activate: function(targetIndex) {
			var $turrent = $stage.eq(index),
				$target = $stage.eq(targetIndex);
			
			if (targetIndex === index || running) {
				return;
			}
			
			_clearAuto();
			
			if (targetIndex > index) {
				$target.prevAll().addClass('stage-state-in stage-state-out');
				$target.addClass('stage-state-in');
				
				slideForIE.next($turrent, $target);
				_nudgeStage4Icons($target);
			} else {
				_freezeStage4Icons($stage.eq(index));
				
				$target.nextAll().removeClass('stage-state-in stage-state-out stage-state-out-in');
				$target.addClass('stage-state-out-in').removeClass('stage-state-out');
				
				slideForIE.prev($turrent, $target);
			}
			
			index = targetIndex;
			
			_run();
			_changeNextButton();
			_activateSlidebar();
		},
		
		autoOnce: function() {
			var $turrent, $target;
			
			if (autoRun) {
				return;
			}
			autoRun = true;
			
			var auto = function() {
				if (index + 1 > len - 1) {
					return;
				}
				
				autoTimer = setTimeout(function() {
					if (index === 0) {
						$current = $stage.eq(index).addClass('stage-state-in');
						delay(100).done(function() {
							$current.addClass('stage-state-out');
						});
					} else {
						$current = $stage.eq(index).addClass('stage-state-out');
					}
					
					$target = $stage.eq(++index).addClass('stage-state-in');
					
					slideForIE.next($current, $target);
					
					_nudgeStage4Icons($stage.eq(index));
					_changeNextButton();
					_activateSlidebar();
					
					auto();
				}, 4000);
			};
			
			auto();
		}
	};
})();

slide.start();
slipblock.start();
emScale.start();
stage4.start();
fixie.start();

/* 活动推广下线，作为后期上线的数据模板 
stage4IconTip.setSource([{
	index: 7,
	text: '用微信插件聊天，赢各种豪礼大奖！',
	url: 'http://liulanqi.baidu.com/hd/wx/?gw',
	className: 'stage-4-icon-item-8-tip'
}]);
*/

var mousewheelHandler = function(event) {
	slide[event.deltaY > 0 ? 'prev' : 'next']();
};

sid.get().done(function(id) {
	packageinfo.update(id);
	download.update(id);
});

$('#nav')
	.on('mouseenter', 'li', function() {
		slipblock.move($(this));
	})
	.on('mouseleave', function() {
		slipblock.back();
	});

ready(function() {
//	require('dialog');
//	$('.dialog').dialog().dialog('open');
	$(document).on('mousewheel', mousewheelHandler);
	$(document).on('keydown', function(event) {
			switch (event.keyCode) {
				case keycode.DOWN:
				case keycode.RIGHT:
					slide.next();
					break;
				case keycode.UP:
				case keycode.LEFT:
					slide.prev();
					break;
					
				case keycode.ENTER:
					slide.autoOnce();
					break;
				
				default:
					break;
			}
		});
		
	$('.button-next')
		.on('click', '.button-next-icon', function() {
			slide.next();
		})
		.on('click', '.button-next-guide', function() {
			
			// 微信专版直接跳转
			slide.activate(4);
		});
	
	$('#slidebar').on('click', 'li', function(event) {
		event.preventDefault();
		slide.activate($(this).index());
	});
	
	$('.button-download').on('click', function() {
		if (window._hmt) {
            _hmt.push(['_trackEvent', '主页下载按钮', '下载', '下载']);
        }
	});
});