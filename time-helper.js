var timeHelper = {
	getTimeFromStr: function(time) {
		var date = new Date();

		time = time.split(':');
		date.setHours(time[0]);
		date.setMinutes(time[1]);

		if (time.length >= 3) {
			date.setSeconds(time[2]);
		}

		return date;
	},

	getTime: function(time) {
		time = +time;

		var hours = Math.floor(time / (1000 * 60 * 60)),
			minutes = Math.floor(time / (1000 * 60)) - hours * 60,
			second = Math.floor(time / 1000) - hours * 60 * 60 - minutes * 60;

		return {
			hours: hours,
			minutes: minutes,
			second: second
		};
	},

	getTimeDif: function(start, end) {
		if (!(start instanceof Date) || !(end instanceof Date)) {
			return null;
		}

		var dif = end - start;

		if (dif <= 0) {
			return null;
		}

		return this.getTime(dif);
	},

	getTimeOver: function(start, end, base) {
		if (!this.getTimeDif(start, end)) {
			return null;
		}

		base = base * 60 * 60 * 1000;

		var t = end - start,
			dif = t - base,
			ret = {},
			time;

		if (dif === 0) {
			return null;
		}

		ret.over = dif > 0;
		time = this.getTime(Math.abs(dif));

		ret.hours = time.hours;
		ret.minutes = time.minutes;
		ret.second = time.second;

		return ret;
	}
};