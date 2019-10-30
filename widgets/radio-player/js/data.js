var REQUEST_URLS = {
	RADIO_LIST: 'http://webapi.br.baidu.com/V1/op_xm_radio_list.jsonp',
	DEFAULT_SONG_LIST: 'http://webapi.br.baidu.com/V1/op_xm_radio_random.jsonp',
	GROUP_SONG_LIST: 'http://webapi.br.baidu.com/V1/type/{type}/id/{id}/group/{group}/op_xm_radio_song.jsonp'
};

var Data = {
	getSongList: function(options) {
		var defer = $.Deferred(),
			url = options.type === 'random' ? 
				REQUEST_URLS.DEFAULT_SONG_LIST :
				REQUEST_URLS.GROUP_SONG_LIST.replace('{type}', options.type)
					.replace('{id}', options.id)
					.replace('{group}', options.groupIndex);
		
		$.ajax(url, {
			cache: true,
			dataType: 'jsonp',
			jsonp: 'cb',
			jsonpCallback: 'songlist'
		}).done(function(res) {
			if (res.errCode === 0) {
				defer.resolve(res.data);
			} else {
				defer.reject();
			}
		}).fail(function() {
			defer.reject();
		});
		
		return defer.promise();
	},
	
	getRadioList: function() {
		var defer = $.Deferred();
		
		$.ajax(REQUEST_URLS.RADIO_LIST, {
			cache: true,
			dataType: 'jsonp',
			jsonp: 'cb',
			jsonpCallback: 'radiolist'
		}).done(function(res) {
			if (res.errCode === 0) {
				defer.resolve(res.data);
			} else {
				defer.reject();
			}
		}).fail(function() {
			defer.reject();
		});
		
		return defer.promise();
	}
};
