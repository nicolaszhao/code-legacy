var rpath = /^(https?:\/\/[^/]+\/(?:[^/]+\/)*)/,
	rwx = /MicroMessenger/i;

var sound = {
	play: function() {
		this.player.play();
	},
	
	pause: function() {
		this.player.pause();
	},
	
	updatePlayState: function(page) {
		if (!this.player) {
			return;
		}
		
		var $button = $(page).is('.button-sound') ? $(page) : $(page).find('.button-sound');
		$button.toggleClass('button-sound-pause', this.player.paused);
	},
	
	events: function() {
		var that = this;
		
		$('body')
			.on('vclick.sound', function() {
				that.player.play();
				$(this).off('.sound');
			})
			.on('click', '.button-sound', function() {
				that.player.togglePause();
				that.updatePlayState(this);
				return false;
			});
	},
	
	init: function() {
		var basePath = rpath.exec(location.href)[1],
			swfPath = basePath + 'js/libs/soundmanager/swf/',
			musicPath = basePath + 'media/music.mp3',
			that = this;
			
		soundManager.setup({
		    url: swfPath,
		    flashVersion: 9,
		    preferFlash: false,
		    forceUseGlobalHTML5Audio: true,
		    ignoreMobileRestrictions: true,
		    onready: function() {
		    	that.player = soundManager.createSound({
		    		url: musicPath,
		    		onfinish: function() {
		    			that.player.play();
		    		}
		    	});
				
				if (rwx.test(navigator.userAgent)) {
					that.play();
				}

                that.events();
		    }
		});
	}
};

module.exports = sound;


