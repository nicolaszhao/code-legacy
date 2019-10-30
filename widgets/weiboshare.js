(function(global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(global);
	} else {
		factory(global);
	}
}(window, function(window) {
	
var weiboShare = function(picLink, title, contentLocation, charset) {

    var picLink = picLink || '',
        source = '',
        sourceUrl = '',
        weiboApi = 'http://v.t.sina.com.cn/share/share.php?appkey=1168640186',
        currentLocation = '',
        params = ['&url=', encodeURIComponent(currentLocation), '&title=', encodeURIComponent(title || document.title), '&source=', encodeURIComponent(source), '&sourceUrl=', encodeURIComponent(sourceUrl), '&content=', charset || 'gb2312', '&pic=', encodeURIComponent(picLink || '')].join('');

    function share() {
        window.open([weiboApi, params].join(''));
    }
    
    if (/Firefox/.test(navigator.userAgent)) setTimeout(share, 0);
    else share();
};

window.weiboShare  = weiboShare;
	
return weiboShare;
	
}));