(function() {
	
var liveForum = function() {
	var i = 0,
		text = '',
		
		loadStyle = function(css) {
			var style = document.createElement("style");
			style.type = "text/css";
			try {
				style.appendChild(document.createTextNode(css));
			} catch (ex) {
		
				// IE
				style.styleSheet.cssText = css;
			}
		
			document.getElementsByTagName("head")[0].appendChild(style);
		},
		
		styles = [
			{
				selector: ['.qing_top', '#pt', '.forum_boardnav', '.qing_foot'],
				rules: {
					display: 'none !important'
				}
			},
			{
				selector: ['#wp'],
				rules: {
					'padding-top': '0',
					'margin': '0'
				}
			}
		];
	
	for (; i < styles.length; i++) {
		text += styles[i].selector.join(',');
		text += '{';
		for (var rule in styles[i].rules) {
			text += rule + ':';
			text += styles[i].rules[rule] + ';';
		}
		text += '}';
	}
	
	loadStyle(text);
};

if (window !== top) {
	liveForum();
}

}());
