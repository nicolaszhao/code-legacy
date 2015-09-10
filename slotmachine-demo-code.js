var _ = require('underscore'),
	utils = require('utils'),
	weiboshare = require('weiboshare'),
	brApi = require('br-api'),
	Dialog = require('dialog'),
	Data = require('app/data'),
	Reporter = require('app/reporter');
	
require('jquery-plugins/jquery.mousewheel');
require('jquery-plugins/jquery.simpleslide');
require('jquery-plugins/jquery.slotmachine');
require('jquery-plugins/jquery.cookie');

var STATUS = {
		ORIGINAL: 0,
		COMPUTER_WIN: 1,
		COMPUTER_WIN_NO_EXCHANGED: 2,
		COMPUTER_LOST: 3,
		ACCOUNT_WIN: 4,
		ACCOUNT_LOST: 5
	},
	
	IQIYI_URL = 'http://vip.iqiyi.com/jihuoma.html?fc=9a0e4d2f2b604513',
	DOWNLOAD_URL = 'http://j.br.baidu.com/v1/t/ui/p/browser/tn/{0}/ch_dl_url',
	
	supplies = {
		'10000281': '凤巢',
		'10000282': '网盟',
		'10000283': '品专',
		'10000284': '活动页',
		'10000285': '贴吧',
		'10000286': '搜索结果页',
		'10000287': '市场渠道'
	},
	
	rnewbdbrowser = /^(\d\.\d).*/,
	rep = Reporter(),
	query = utils.getQueryString(),
	sidType = 1,
	apiReqTimer, apiReqTimeout;

var shareControl = {
	_getImageFullPath: function(image) {
		var pathIndex = location.href.lastIndexOf('/');
		
		if (!/^https?:\/\//.test(image)) {
			image = location.href.substring(0, pathIndex + 1) + image;
		}
		
		return image;
	},
	
	events: function() {
		var that = this;
		
		this.$el.find('.button-share').on('click', function() {
			weiboShare(that.image, that.content);
			rep.shareClick();
		});
	},
	
	init: function() {
		this.$el = $('.lottery-share');
		this.content = this.$el.find('.lottery-share-content').text();
		this.image = this._getImageFullPath(this.$el.find('.lottery-share-image').attr('src'));
		
		this.events();
	}
};

var luckyList = {
	render: function() {
		var that = this;
		
		Data.getLuckyList().done(function(data) {
			if ($.type(data) !== 'array' || !data.length) {
				that.$container.hide();
				return;
			}
			
			that.$el.empty().append(that.tmpl({items: data}));
			
			if (data.length > 7) {
				that.$el.simpleslide({
					visible: 7,
					auto: true,
					vertical: true,
					showButtons: false,
					extra: 0
				}).on('mousewheel', function(event) {
					that.$el.simpleslide(event.deltaY > 0 ? 'prev' : 'next');
					event.preventDefault();
				});
			}
		});
	},
	
	init: function() {
		this.$el = $('.lucky-list');
		this.$container = $('#lucky');
		
		this.tmpl = _.template(__inline('template/lucky-list.html'));
		this.render();
	}
};

var accountManager = {
	update: function(data) {
		this.originalData = data;
		
		this.isLogin = data.is_login;
		this.bduid = this.isLogin ? data.uid : 0;
		this.bduss = this.isLogin ? data.bduss : '';
		this.displayName = data.display_name || '';
	},
	
	getAccount: function() {
		var defer = $.Deferred(),
			that = this;
		
		brApi.getAccount().done(function(data) {
			that.update(data);
			
			defer.resolve({
				bduid: that.bduid,
				bduss: that.bduss,
				
			});
		});
			
		return defer.promise();
	},
	
	listenAccount: function(callback, context) {
		brApi.listenAccount(_.bind(callback, context));
	}
};

var dialogManager = {
	dialogs: {
		install: $('#install-dialog'),
		winning: $('#winning-dialog'),
		losing: $('#losing-dialog'),
		signin: $('#signin-dialog'),
		accountCheck: $('#lottery-check-1-dialog'),
		pcCheck: $('#lottery-check-2-dialog'),
		error: $('#networkerror-dialog')
	},
	
	events: function() {
		var that = this;
		
		this.exchangeClipboard.on('ready', function() {
			this.on('copy', function(event) {
				this.setText(that.dialogs.winning.find('.pointcode').val());
				rep.copyClick();
				
				window.open(IQIYI_URL, '_blank');
			});
		});
		
		this.dialogs.winning.on('click', function() {
			rep.exchangeDialogClick();
		});
	},
	
	init: function() {
		var exchangeButton = this.dialogs.winning.find('.dialog-button-ok').get(0);
		
		this.exchangeClipboard = new ZeroClipboard(exchangeButton);
		this.events();
		
		$('.dialog').dialog();
		
		this.dialogs.losing.dialog('option', {
			ok: function(ui) {
				this.close();
				rep.vipbuttonClick();
				window.open(ui.find('.dialog-button-ok').attr('href'), '_blank');
			}
		});
		
		// 断网前预加载窗口背景图片等
		this.dialogs.error.css({
			'display' : 'block',
			top : -9999,
			left : -9999
		})
			.css('display', 'none');
	}
};

var downloadManager = {
	updateUrl: function() {
		var defaultId = '10000284';
			
		if (query.supply && supplies[query.supply]) {
			sid = query.supply;
			rep.pageload(supplies[query.supply], 'others');
		} else {
			sid = defaultId;
		}
		
		this.$el.attr('href', DOWNLOAD_URL.replace('{0}', sid));
	},
	
	events: function() {
		this.$el.on('click', function() {
			rep.downloadClick($(this).closest('.dialog').length ? 'popup' : 'top');
		});
		
		$('.lottery-drawbuttons').on('click', '.button-draw', function() {
			dialogManager.dialogs.install.dialog('open');
			rep.drawClick('slotBottom');
		});
		
		$('.slot-play-button').on('click', function(event) {
			event.preventDefault();
			dialogManager.dialogs.install.dialog('open');
			rep.drawClick('slotRight');
		});
	},
	
	init: function() {
		this.$el = $('.button-download');
		
		this.updateUrl();
		this.events();
	}
};

var lotteryManager = {
	_changeTopButton: function() {
		$('.lottery-topbuttons').find('.button-download').hide()
			.siblings('.button-draw').show();
	},
	
	_changeDrawButtonByStatus: function(status) {
		var drew = status !== STATUS.ORIGINAL;
		
		this.canDraw = !drew;
		
		$('.lottery-drawbuttons').find('.button-draw').toggle(!drew)
			.siblings('.button-check').toggle(drew);
	},
	
	_toggleDrawLinks: function() {
		$('.lottery-drawlinks').toggle(accountManager.isLogin);
	},
	
	_draw: function() {
		
		// 活动下线
		return;
		
		var that = this,
			reqdata = {}, 
			reqStatus, reqCallback, status, result,
			
			request = function() {
				var defer = $.Deferred();
				
				if (accountManager.isLogin) {
					reqdata = {
						uid: accountManager.bduid,
						bduss: accountManager.bduss,
						display_name: accountManager.displayName
					};
				}
				
				reqdata.old = sidType;
				
				Data.drawLottery(reqdata)
					.done(function(data) {
						reqCallback = function() {
							status = that._convertStatus(data.pre_status);
							
							// 在抽奖时可能作弊或者其他原因，导致返回的状态是已抽奖，这时将不给予抽奖，并更新当前的真实状态
							if (status !== STATUS.ORIGINAL) {
								if (status === STATUS.ACCOUNT_LOST || status === STATUS.ACCOUNT_WIN) {
									dialogManager.dialogs.accountCheck.dialog('open');
								} else {
									dialogManager.dialogs.pcCheck.dialog('open');
								}
								
								return that._updateStatus();
							}
							
							result = data.result;
							if (result.status <= 0) {
								dialogManager.dialogs.losing.dialog('open');
							} else if (result.status === 1) {
								if (accountManager.isLogin) {
									that._savePrize(result.code);
									dialogManager.dialogs.winning.dialog('open');
								} else {
									dialogManager.dialogs.signin.dialog('open');
								}
							}
							
							that._updateStatus();
						};
							
						defer.resolve(data.result.type);
					})
					.fail(function() {
						reqCallback = function() {
							dialogManager.dialogs.error.dialog('open');
						};
						defer.resolve();
					});
				
				return defer.promise();
			};
		
		if (this.playing || !this.ready) {
			return;
		}
		this.playing = true;
		
		this._slotAnim(request).done(function() {
			that.playing = false;
			reqCallback();
		});
	},
	
	_exchange: function() {
		var that = this,
			reqdata = {};
		
		// 这里因为有可能用户直接点击按钮，且当前状态为未领取
		if (!accountManager.isLogin) {
			return dialogManager.dialogs.signin.dialog('open');
		}
		
		// 在兑换前如果当前状态为已抽奖，或之前的绑定失败并且是已抽过的失败，会走这里
		if (this.status === STATUS.ACCOUNT_WIN || 
			this.status === STATUS.ACCOUNT_LOST) {
			
			return dialogManager.dialogs.accountCheck.dialog('open');
		}
		
		if (this.exchanging) {
			return;
		}
		this.exchanging = true;
		
		reqdata = {
			uid: accountManager.bduid,
			bduss: accountManager.bduss,
			display_name: accountManager.displayName
		};
		
		reqdata.old = sidType;
		
		Data.bindAccount(reqdata)
			.done(function() {
				that.exchanged = true;
			})
			.fail(function(exchanged) {
				if (!exchanged) {
					dialogManager.dialogs.error.dialog('open');
				}
			})
			.always(function() {
				that._updateStatus().done(function() {
					that.exchanging = false;
				});
			});
	},
	
	_savePrize: function(code) {
		dialogManager.dialogs.winning.find('.pointcode').val(code);
	},
	
	_check: function() {
		if (!this.ready) {
			return;
		}
		
		switch (this.status) {
			case STATUS.ACCOUNT_WIN:
				dialogManager.dialogs.winning.dialog('open');
				break;
				
			case STATUS.ACCOUNT_LOST:
				dialogManager.dialogs.losing.dialog('open');
				break;
				
			case STATUS.COMPUTER_WIN:
			case STATUS.COMPUTER_LOST:
				dialogManager.dialogs.pcCheck.dialog('open');
				break;
				
			case STATUS.COMPUTER_WIN_NO_EXCHANGED:
				this._exchange();
				break;
				
			default:
				break;
		}
	},
	
	_stop: function() {
		var currentDate = new Date(),
			endDate = [2015, 2, 15];
		
		if (currentDate.getFullYear() === endDate[0] 
				&& (currentDate.getMonth() + 1) === endDate[1] 
				&& currentDate.getDate() > endDate[2]) {
					
			// TODO: 需要处理活动结束状态
		}
	},
	
	_convertStatus: function(data) {
		var status;
		
		if (accountManager.isLogin && data.uid !== -1) {
			status = data.uid === 0 ? STATUS.ACCOUNT_LOST : STATUS.ACCOUNT_WIN;
		} else {
			switch (data.guid) {
				case -1:
					status = STATUS.ORIGINAL;
					break;
				case 0:
					status = STATUS.COMPUTER_LOST;
					break;
				case 1:
					status = STATUS.COMPUTER_WIN;
					break;
				case 2:
					status = STATUS.COMPUTER_WIN_NO_EXCHANGED;
					break;
				default:
					break;
			}
		}
		
		return status;
	},
	
	_updateStatus: function() {
		var defer = $.Deferred(),
			that = this,
			userdata;
		
		accountManager.getAccount().done(function(data) {
			that._toggleDrawLinks();
			
			if (accountManager.isLogin) {
				userdata = {
					uid: data.bduid,
					bduss: data.bduss
				};
			}

			Data.getLotteryStatus(userdata).done(function(data) {
				that.ready = true;
				that.status = that._convertStatus(data);
				that._changeDrawButtonByStatus(that.status);
				
				if (accountManager.isLogin) {
					if (data.code) {
						that._savePrize(data.code);
						
						// 这里保证只有在兑换并绑定账户成功后执行，绑定账户成功后退出再登陆后不再自动走兑换逻辑
						if (that.exchanged) {
							dialogManager.dialogs.winning.dialog('open');
							that.autoExchange = false;
							that.exchanged = false;
						}
					}
					
					// 在手动点击登陆兑换按钮，或者之前的绑定失败会再次进入自动兑换逻辑
					if (that.autoExchange) {
						that._exchange();
					}
				}
				
				defer.resolve();
			});
		});
		
		return defer.promise();
	},
	
	_slotAnim: function(request) {
		var defer = $.Deferred(),
			slots = this.slots,
			startDelay = 500,
			stopDelay = 3000,
			result = [],
			$machine;
			
			stop = function(ret) {
				
				if ($.type(ret) === 'number') {
					result = ret;
				} else {
					result[0] = slots[0].getRandom();
					result[1] = result[0] + 1 >= 4 ? 0 : result[0] + 1;
					result[2] = slots[0].getRandom();
				}
				
				setTimeout(function() {
					slots[0].stop(true, $.type(result) === 'array' ? result[0] : result);
				}, stopDelay);
			};
		
		if (!slots.length) {
			if (typeof request === 'function') {
				request().done(function() {
					defer.resolve();
				});
			} else {
				defer.resolve();
			}
			
			return defer.promise();
		}
		
		$machine = $('.slot-machine-front').addClass('slot-machine-state-playing');
		
		setTimeout(function() {
			$.each(slots, function(i, slot) {
				setTimeout(function() {
					slot.shuffle('repeat', function() {
						var j = i + 1;
						if (slots[j]) {
							slots[j].stop(true, $.type(result) === 'array' ? result[j] : result);
						} else {
							$machine.removeClass('slot-machine-state-playing');
							defer.resolve();
						}
					});
				}, startDelay * i);
			});
		
		// CSS3背景开始动画所需时间
		}, 1000);
			
		if (typeof request === 'function') {
			request().done(stop);
		} else {
			stop();
		}
		
		return defer.promise();
	},
	
	events: function() {
		var that = this;
		
		$('.lottery-topbuttons')
			.on('click', '.button-draw', function() {
				$(document).scrollTop($('#lottery').offset().top);
				that.canDraw ? that._draw() : that._check();
				
				rep.drawClick('top');
			});
			
		$('.lottery-drawbuttons')
			.on('click', '.button-draw', function() {
				that._draw();
				rep.drawClick('slotBottom');
			})
			.on('click', '.button-check', function() {
				that._check();
				rep.drawClick('slotBottom');
			});
			
		$('.slot-play-button').on('click', function(event) {
			event.preventDefault();
			that.canDraw ? that._draw() : that._check();
			rep.drawClick('slotRight');
		});
		
		$('.lottery-pointcodes-check').on('click', function(event) {
			
			// 需要在特权中心页自动打开激活码兑换历史窗口
			$.cookie('opencodes', '1', {path: '/'});
			
			rep.codesClick();
		});
	},
	
	ready: false,
	
	init: function() {
		var that = this;
		
		this.slots = [];
		
		// slot only support for IE10+
		if (Modernizr.cssanimations) {
			$('.slot-machine-item').each(function(i) {
				$(this).find('.slot-icon').show();
				that.slots[i] = $(this).slotMachine({
					active: 3,
					delay: 600
				});
			});
		}
		
		this._changeTopButton();
		this._updateStatus();
		this.events();
		
		brApi.getChannelId().done(function(sid) {
			if (supplies[sid]) {
				sidType = 0;
				rep.pageload(supplies[sid], 'bdbrowser');
			}
		});
		
		accountManager.listenAccount(this._updateStatus, this);
		
		dialogManager.dialogs.signin.dialog('option', {
			ok: function(ui) {
				this.close();
				rep.loginClick();
				
				// 在打开登录兑换激活码提醒窗口状态下，用户点击了浏览器的登录窗口并登录成功，
				// 页面会走监听，这时需要再次判断用户的登录状态
				if (accountManager.isLogin) {
					that._exchange();
				} else {
					
					// 这里使用一个标记，来处理登录后的切换状态从而自动走兑换逻辑
					that.autoExchange = true;
					
					brApi.openLoginDialog();
				}
			}
		});
	}
};

// just for report
$('.steps-notes a').on('click', function() {
	rep.viplinkClick();
});

luckyList.init();
shareControl.init();
dialogManager.init();

if (!brApi.isBDBrowser) {
	return downloadManager.init();
}

try {
	
	// 非特权域的低版本百度浏览器的webkit核请求接口不会返回callback
	apiReqTimer = setTimeout(function() {
		apiReqTimeout = true;
		downloadManager.init();
	}, 1500);
	
	brApi.getVersion().done(function(version) {
		clearTimeout(apiReqTimer);
		
		if (apiReqTimeout) {
			return;
		}
		
		var match = rnewbdbrowser.exec(version);
		
		if (match && match[1] >= 7.3) {
			lotteryManager.init();
		} else {
			downloadManager.init();
		}
	});
} catch(ex) {
	clearTimeout(apiReqTimer);
	
	// 非特权域的低版本百度浏览器在IE核下回报错
	downloadManager.init();
}
