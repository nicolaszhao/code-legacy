/*
 * 异步请求
 * date: Sep 4th, 2012
 */
var Ajax = {
	createXHR: (function() {
		var versions, i, len, xhr;

		if ( typeof XMLHttpRequest !== 'undefined') {
			return function() {
				return new XMLHttpRequest();
			};

		} else if ( typeof ActiveXObject !== 'undefined') {
			return function() {
				if ( typeof arguments.callee.activeXString !== 'string') {
					versions = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHTTP'];
					for ( i = 0, len = versions.length; i < len; i++) {
						try {
							xhr = new ActiveXObject(versions[i]);
							arguments.callee.activeXString = versions[i];

							return xhr;
						} catch ( ex ) {
						}
					}
				}

				return new ActiveXObject(arguments.callee.activeXString);
			};

		} else {
			return function() {
				throw new Error('No XHR object available.');
			};
		}
	})(),

	/*
	 * example:
	 * var req = createCORSRequest( 'get', 'http://nicolas.com/code-libraries/' );
	 * if ( req ) {
	 *     req.onload = function() { req.responseText; }
	 * 	   req.send( null );
	 * }
	 *
	 */
	createCORSRequest: function(method, url) {
		var xhr = new XMLHttpRequest();

		if ('withCredentials' in xhr) {
			xhr.open(method, url, true);
		} else if ( typeof XDomainRequest !== 'undefined') {
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			xhr = null;
		}

		return xhr;
	},

	/*
	 * server example:
	 * <?php
	 * $i = 0;
	 * while(true) {
	 *     echo 'Number is $i';
	 * 	   flush();
	 *     sleep(10);
	 *     $i++;
	 * }
	 * ?>
	 *
	 * note: except IE
	 */
	createStreamingClient: function(url, progress, done) {
		var xhr = new XMLHttpRequest(), received = 0;

		xhr.onreadystatechange = function() {
			var ret;

			if (xhr.readyState == 3) {
				ret = xhr.responseText.substring(received);
				received += ret.length;

				progress(ret);

			} else if (xhr.readyState == 4) {
				done(xhr.responseText);
			}
		};

		xhr.open('get', url, true);
		xhr.send(null);

		return xhr;
	}
}; 