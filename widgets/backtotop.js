require('jquery-plugins/jquery.pos');

var $win = $(window),
	$doc = $(document),
	widgetId = 0;
	
var Backtotop = function(options) {
	this.id = ++widgetId;
	this.eventNamespace = '.backtotop-' + this.id;
	this.$at = $(options.at);
	this.state = 'hidden';
	this.isIE6 = $('html').hasClass('ie6');
};

Backtotop.prototype = {
	constructor: Backtotop,
	
	create: function() {
		this.$el = $('<a>', {
			'class': 'button button-backtotop',
			'title': '返回顶部',
			'text': '返回顶部'
		})
			.css('display', 'none');
			
		this.$el.pos({
			my: 'left+15 bottom',
			at: 'right bottom',
			of: this.$at
		});
		
		this.repos();
		this.events();
		
		return this;
	},
	
	repos: function() {
		var state = $doc.scrollTop() > $win.height() ? 'visible' : 'hidden';
		
		if (state !== this.state) {
			this.state = state;
			this.toggle();
		}
		
		if (this.state === 'visible') {
			this.$el.pos('pos');
		}
	},
	
	toggle: function() {
		this.$el[this.state === 'visible' ? 'fadeIn' : 'fadeOut']();
	},
	
	events: function() {
		var eventname = ['resize', 'scroll'],
			that = this;
		
		this.$el.on('click.backtotop', function(event) {
			$(this).fadeOut();
			$('html, body').animate({scrollTop: 0});
			event.preventDefault();
		});
		
		eventname = $.map(eventname, function(name) {
			return name + that.eventNamespace;
		}).join(' ');
		
		$win.on(eventname, _.throttle(_.bind(this.repos, this), 
			this.isIE6 ? 25 : 0));
	},
	
	destroy: function() {
		$win.off(this.eventNamespace);
		this.$el.off('.backtotop').remove();
	}
};

module.exports = Backtotop;
