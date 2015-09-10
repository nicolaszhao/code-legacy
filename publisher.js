var publisher = {
	_subscribers: {},
	_guid: -1,

	subscribe: function(label, callback) {
		var guid = ++this._guid + '';

		if(!this._subscribers[label]) {
			this._subscribers[label] = [];
		}

		this._subscribers[label].push({
			guid: guid,
			callback: callback
		});

		return guid;
	},

	unsubscribe: function(guid) {
		var subscribers = this._subscribers;

		for(var label in subscribers) {
			if(subscribers[label]) {
				for(var i = 0, len = subscribers[label].length; i < len; i++) {
					if(subscribers[ label ][i].guid === guid) {
						subscribers[label].splice(i, 1);

						return true;
					}
				}
			}
		}

		return false;
	},

	publish: function(label, args) {
		var subscribe = this._subscribers[label], len;

		if(!subscribe || !subscribe.length) {
			return false;
		}
		len = subscribe.length;
		while(len--) {
			subscribe[len].callback(args);
		}

		return true;
	}

};
