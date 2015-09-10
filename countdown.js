var countDown = {
	format: function(num) {
		return num < 10 ? '0' + num : num;
	},
	
	calc: function(deadline, callbacks) {
		var now = new Date(),
			dif = deadline - now,
			that = this,
			hours, minutes, second;
			
		if (dif <= 0) {
			return callbacks.done();
		}
		
		hours = Math.floor(dif / (1000 * 60 * 60));
		minutes = Math.floor(dif / (1000 * 60)) - hours * 60;
		second = Math.floor(dif / 1000) - hours * 60 * 60 - minutes * 60;
		
		callbacks.process(hours, minutes, second);
		setTimeout(function() {
			that.calc(deadline, callbacks);
		}, 1000);
	},
	
	refresh: function($el, deadline, done) {
		var that = this;
		
		this.calc(deadline, {
			process: function(hours, minutes, second) {
				$el.find('.clock-item-hour').text(that.format(hours))
					.siblings('.clock-item-minute').text(that.format(minutes))
					.siblings('.clock-item-second').text(that.format(second));
			},
			done: done
		});
	}
};