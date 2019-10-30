var SONG_SEARCH = 'http://www.xiami.com/search/song?key={0}',
	SOUND_MANAGER_SWF = 'js/libs/soundmanager/swf/';

var rpath = /^(https?:\/\/(?:[^/]+\/)+)(.+\.html)?/,
	serverPath = rpath.exec(location.href)[1],
	csstransforms = Modernizr.prefixed('transform');

soundManager.setup({
	url: serverPath + SOUND_MANAGER_SWF,
	flashVersion: 9
});
	
var RadioPlayer = function(el) {
	this.$el = $(el);
	this.$player = this.$el.find('.radio-player');
	
	this.curRadio = {};
	
	this._generateControls();
	this._defaultAlbumImage();
	this._playStore = {};
	this._create();
};

RadioPlayer.prototype = {
	constructor: RadioPlayer,
	
	_create: function() {
		this._volume();
		this._events();
	},
	
	_events: function() {
		var that = this;
		
		this.$player.find('.radio-player-state').on({
			mouseenter: function() {
				that._toggleState('in');
			},
			mouseleave: function() {
				that._toggleState('out');
			}
		});
		
		this.$play.on('click', function(event) {
			event.preventDefault();
			
			var $button = $(this),
				paused = $button.hasClass('radio-state-play');
				
			that.player[paused ? 'play' : 'pause']();
			that._swichState(!paused);
		});
		
		this.$next.on('click', function(event) {
			event.preventDefault();
			
			if (that.fetching) {
				return;
			}
			
			clearTimeout(that._nextClickTimer);
			that._nextClickTimer = setTimeout(function() {
				that._next(false);
			}, 250);
		});
		
		this.$volumeSwitch.on('click', function(event) {
			event.preventDefault();
			
			var toVoiced = that.player.muted;
			
			that._swichMute(toVoiced, true);
			
			if (toVoiced) {
				that.player.setVolume(that._volumeValue);
			}
		});
	},
	
	_next: function(auto) {
		var $loading = $('.radio-player-state-loading', this.$player),
			store = this._playStore[this._storeKey],
			that = this;
		
		if (!auto) {
			this.player.stop();
		}
		
		this._pause();
		that._swichState(true);
		
		if (store.index + 1 > store.length - 1) {
			this.fetching = true;
			this._toggleLoading(true);
			
			this._fetch().done(function() {
				that._play();
				that.fetching = false;
				that._toggleLoading(false);
			});
		} else {
			store.index++;
			this._play();
		}
	},
	
	_add: function() {
		var store = this._playStore[this._storeKey],
			that = this;
		
		if (this.player) {
			if (this._playerState && this._playerState === 'playing') {
				this.player.stop();
			}
			
			this.player.unload();
			this.player.destruct();
		}
		
		this.player = soundManager.createSound({
			url: store.data[store.index]['listen_file'],
			
			onfinish: function() {
				that._playerState = 'finished';
				that._next(true);
			},
			
			onbufferchange: function() {
				that._toggleLoading(this.isBuffering);
				that[this.isBuffering ? '_pause' : '_rotate']();
			},
			
			whileloading: function() {
				that._playerState = 'loading';
			},
			
			whileplaying: function() {
				that._progress(this.position, this.duration);
				that._playerState = 'playing';
			},
			
			onplay: function() {
				that._swichState(false);
			},
			
			onpause: function() {
				that._swichState(true);
				that._pause();
			},
			
			onresume: function() {
				that._rotate();
			},
			
			onload: function(success) {
				if (!success) {
					soundManager.reboot();
                    that._next();
				}
			}
		});
		
		if (this.$volumeSwitch.hasClass('radio-state-mute')) {
			this.player.mute();
		}
		this.player.setVolume(this._volumeValue);
		this._refresh();
		
		return this.player;
	},
	
	_play: function() {
		this._add().play();
	},
	
	_pause: function() {
		this.$album.addClass('radio-player-album-pause');
	},
	
	_rotate: function() {
		this.$album.removeClass('radio-player-album-pause')
			.addClass('radio-player-album-rotate');
	},
	
	_progress: function(curPosition, duration) {
		if (!Modernizr.csstransforms) {
			return;
		}
		
		var progress = curPosition / duration * 360 || 0;
		
		if (progress < 180) {
			this.$progressbar.find('.radio-player-progressbar-cover-right')
				.css(csstransforms, 'rotate(' + progress + 'deg)');
		} else {
			this.$progressbar.find('.radio-player-progressbar-cover-right').hide()
				.end().find('.radio-player-progressbar-cover-left-inner')
				.css(csstransforms, 'rotate(' + (progress - 180) + 'deg)');
		}
	},
	
	_reset: function() {
		if (!Modernizr.csstransforms) {
			return;
		}
		
		this.$album.removeClass('radio-player-album-rotate radio-player-album-pause');
		
		this.$progressbar.find('.radio-player-progressbar-cover-right').show()
				.css(csstransforms, 'rotate(0deg)')
			.end().find('.radio-player-progressbar-cover-left-inner')
				.css(csstransforms, 'rotate(0deg)');
	},
	
	_fetch: function() {
		var that = this,
			curRadio = this.curRadio,
			options = {},
			storeKey;
		
		if (curRadio.type === 'random') {
			storeKey = curRadio.type;
			this._playStore[storeKey] = {};
			options.type = curRadio.type;
		} else {
			storeKey = curRadio.type + '-' + curRadio.id;
			
			if (!this._playStore[storeKey]) {
				this._playStore[storeKey] = {
					capacity: curRadio.capacity,
					groupIndex: 0
				};
			}
			
			if (this._playStore[storeKey].groupIndex++ >= this._playStore[storeKey].capacity) {
				this._playStore[storeKey].groupIndex = 0;
			}
			
			options = {
				type: curRadio.type,
				id: curRadio.id,
				group: this._playStore[storeKey].groupIndex
			};
		}
		
		this._storeKey = storeKey;
		
		return Data.getSongList(options).done(function(data) {
			that._playStore[storeKey].index = 0;
			that._playStore[storeKey].data = data;
			that._playStore[storeKey].length = data.length;
		}).fail(function() {
			that.error();
		});
	},
	
	_refresh: function() {
		var store = this._playStore[this._storeKey],
			info = store.data[store.index],
			that = this;
			
		this._reset();
		
		this.$album.hide()
			.on('error', function() {
				$(this).off('error').attr('src', that.defaultAlbumImage.src);
			})
			.attr('src', info.album_logo.replace(/_1\.jpg$/, '_2.jpg'))
			.delay(250).fadeIn();
		
		this.$player.find('.radio-player-info').hide()
			.find('.radio-player-info-name')
				.text(info.song_name)
				.attr('href', SONG_SEARCH.replace('{0}', encodeURIComponent(info.song_name)))
				.next('.radio-player-info-artist').text(info.artist_name)
			.end().end().fadeIn();
	},
	
	_volume: function() {
		var that = this;
		
		this._volumeValue = 50;
		
		this.$volumebar.slider({
			value: this._volumeValue,
			range: 'min',
			
			change: function(e, ui) {
				that.player.setVolume(ui.value);
			},
			
			stop: function(event, ui) {
				var voiced = ui.value !== 0;
				
				if (voiced) {
					that._volumeValue = ui.value;
				}
				
				that._swichMute(voiced);
			}
		});
	},
	
	_swichMute: function(toVoiced, swich) {
		this.player[toVoiced ? 'unmute' : 'mute']();
		this.$volumeSwitch.toggleClass('radio-state-voiced', toVoiced)
			.toggleClass('radio-state-mute', !toVoiced);
		
		if (swich) {
			this.$volumebar.slider('value', toVoiced ? this._volumeValue: 0);
		}
	},
	
	_swichState: function(paused) {
		this.$play.toggleClass('radio-state-play', paused)
			.toggleClass('radio-state-pause', !paused);
	},
	
	_toggleState: function(inOrOut) {
		if (this.$play.hasClass('radio-state-pause')) {
			this.$play.stop(true, true)[inOrOut === 'in' ? 'fadeIn' : 'fadeOut'](Modernizr.opacity ? 400 : 0);
		}
	},
	
	_toggleLoading: function(showOrHide) {
		this.$player.find('.radio-player-state-loading').toggle(showOrHide);
	},
	
	_generateControls: function() {
		this.$play = $('.radio-button-play', this.$player);
		this.$next = $('.radio-button-next', this.$player);
		this.$volumebar = $('.radio-player-volume-bar', this.$player);
		this.$volumeSwitch = $('.radio-button-volume-switch', this.$player);
		this.$progressbar = $('.radio-player-progressbar', this.$player);
		this.$album = $('.radio-player-album', this.$player);
	},
	
	_defaultAlbumImage: function() {
		this.defaultAlbumImage = new Image();
		this.defaultAlbumImage.src = serverPath + 'images/album-error.png';
	},
	
	load: function(data) {
		var that = this;
		
		this.curRadio = data;
		this.fetching = true;
		this._toggleLoading(true);
		
		this._fetch().done(function() {
			soundManager.onready(function() {
				if (!that._initialized) {
					that._initialized = true;
					that._add();
				} else {
					that._play();
				}
				
				that._toggleLoading(false);
			});
			
			that.fetching = false;
		});
	},
	
	reset: function() {
		this.$el.find('.radio-error').hide();
	},
	
	error: function() {
		this.$el.find('.radio-error').show();
	}
};