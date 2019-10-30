var Radios = function(el) {
	this.$el = $(el);
	this.$widget = this.$el.find('.radio-channels');
	this.$radios = this.$widget.find('.radio-channels-types-pane');
	
	this.player = new RadioPlayer(el);
	this.selectIndex = 0;
	
	this._termIndex = -1;
	this._create();
};

Radios.prototype = {
	constructor: Radios,
	
	_create: function() {
		this.update();
		this._events();
	},
	
	_events: function() {
		var that = this;
		
		this.$el
			.on('click', '.radio-button-refresh', function(event) {
				event.preventDefault();
				that.player.reset();
				that.update();
			})
			.on('error', function() {
				that.player.error();
			});
		
		this.$widget
			.on('click', '.radio-button-expand', function(event) {
				var $button = $(this);
				
				that.$radios.toggle('slide', {
					direction: 'down'
				}, function() {
					$button.toggleClass('radio-state-expand radio-state-collapse');
				});
				
				return false;
			})
			.on('click', '.radio-button-change-types', function(event) {
				event.preventDefault();
				that._change();
			})
			.on('click', '.radio-channels-types li', function(event) {
				event.preventDefault();
				
				if (that.player.fetching) {
					return;
				}
				
				that._select($(this).index());
			});
			
		if (!Radios._initialized) {
            $(document).on('click', function(event) {
                var $pane = $('.radio-channels-types-pane');
                
                if (!$(event.target).closest('.radio-channels').length &&
                    $pane.is(':visible')) {
                    	
                    $pane.hide('slide', {direction: 'down'}, function() {
                        $(this).siblings('.radio-channels-control-pane')
                            .find('.radio-button-expand')
                            .toggleClass('radio-state-expand radio-state-collapse');
                    });
                }
            });

			Radios._initialized = true;
		}
	},
	
	_update: function() {
		var that = this;
		
		this.$el.find('.radio-player-loading').show();
		this.$radios.find('.radio-channels-loading').show();
		
		return Data.getRadioList().done(function(data) {
			that.$radios.find('.radio-channels-types-pane-inner').empty()
				.append('<a class="radio-button-change-types" href="#">' + 
					'<span class="radio-button-icon"></span>换一换</a>');
					
			that.$el.find('.radio-player-loading').fadeOut();
			that.$radios.find('.radio-channels-loading').hide();
			
			that.radios = data.reverse();
			that._change(that.radios);
		}).fail(function() {
			that.player.error();
		});
	},
	
	_change: function(radios) {
		radios = radios || this.radios;
		
		this.groupIndex  = (typeof this.groupIndex !== 'undefined' ? 
			(this.groupIndex + 1 > radios.length - 1 ? 0 : this.groupIndex + 1) : 0);
			
		radios = utils.getRandoms(radios[this.groupIndex].radios, 7);
		
		var $ul = this.$radios.find('.radio-channels-types'),
			customSelected = this.selectIndex !== 0,
			li = ['<li data-type="random" data-name="随心听"><a href="">随心听</a></li>'],
			$active, visitedData;
		
		
		
		if (!$ul.length) {
			$ul = $('<ul class="radio-channels-types" />')
				.prependTo(this.$radios.find('.radio-channels-types-pane-inner'));
		}
		
		if (customSelected) {
			if (this.visitedChannel) {
				visitedData = this.visitedChannel.data;
				$active = $('<li data-id="' + visitedData.id + 
						'" data-type="' + visitedData.type + 
						'" data-name="' + visitedData.name + 
						'" data-capacity="' + visitedData.capacity + '">' + 
						'<a href="">' + this.visitedChannel.text + '</a></li>').appendTo('body');
					
				this.visitedChannel = null;
			} else {
				$active = $ul.find('li').eq(this.selectIndex).clone(true);
			}
		}
		
		$.each(radios, function(i, radio) {
			var radioText = radio.name.replace('电台', '');
			
			if (radioText.toLowerCase() === "older's") {
				radioText = '经典';
			}
			
			// continue to next
			if ($active && $active.data('type') === radio.type && $active.data('id') === radio.id) {
				return;
			}
			
			li.push('<li data-id="' + radio.id + 
					'" data-type="' + radio.type + 
					'" data-name="' + radioText + 
					'" data-capacity="' + radio.capacity + '">' + 
					'<a href="">' + radioText + '</a></li>');
		});
		
		if (customSelected) {
			if (li.length - 1 === radios.length) {
				li.splice(1, 1);
			}
			
			$ul.empty().append(li.join('')).find('li').eq(this.selectIndex - 1).after($active);
		} else {
			$ul.empty().append(li.join(''));
		}
		
		this._select();
	},
	
	_select: function(index) {
		var $active, channel;
		
		index = (typeof index === 'undefined' ? this.selectIndex : index);
		
		this.$radios.find('.radio-channels-types')
			.find('li').removeClass('radio-channels-type-active')
			.eq(index).addClass('radio-channels-type-active');
		
		if (index === this._termIndex) {
			return;
		}
		
		$active = this.$radios.find('.radio-channels-types li').eq(index);
		channel = $active.find('a').text();
		this.player.load($active.data());
		this._termIndex = index;
		this.selectIndex = index;
		
		$('.radio-button-expand', this.$widget)
			.find('.radio-cur-channel-text').text(channel);
		
		if (window.localStorage) {
			localStorage.setItem('radio', JSON.stringify({
				selectIndex: index,
				text: channel,
				data: $active.data()
			}));
		}
	},
	
	update: function() {
		var radio;
		
		if (window.localStorage) {
			radio = JSON.parse(localStorage.getItem('radio')) || {};
			if (typeof radio.selectIndex === 'number') {
				this.selectIndex = radio.selectIndex;
				this.visitedChannel = radio;
			}
		}
		
		this._update();
	}
};
