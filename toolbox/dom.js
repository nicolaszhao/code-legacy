/*
 * 与文档对象处理相关
 * date: July 13, 2012
 */
var dom = {

	// 将一个HTML集合转换为数组
	// coll: 元素集合
	toArray: function(coll) {
		var arr = [], len = coll.length, i;

		for ( i = 0; i < len; i++) {
			arr.push(coll[i]);
		}

		return arr;
	},

	getAttributes: function(element) {
		var pairs = {}, attr, attrName, attrValue, i, len;

		for ( i = 0, len = element.attributes.length; i < len; i++) {
			attr = element.attributes[i];

			attrName = attr.nodeName;
			attrValue = attr.nodeValue;
			if (attr.specified) {
				pairs[attrName] = attrValue;
			}
		}

		return pairs;
	},

	// 文件加载
	// ------------------------------------------------------------------

	// 动态加载外部的JavaScript或CSS文件
	// type: js或css
	_loadFile: function(type, url, callback) {
		var elem;

		if (type === 'js') {
			elem = document.createElement('script');
			elem.type = 'text/javascript';
		} else if (type === 'css') {
			elem = document.createElement('link');
			elem.rel = 'stylesheet';
			elem.type = 'text/css';
		}

		if (callback) {

			// IE
			if (elem.readyState) {
				elem.onreadystatechange = function() {
					if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
						elem.onreadystatechange = null;
						callback();
					}
				};
			} else {
				elem.onload = function() {
					callback();
				};
			}
		}

		elem[type === 'js' ? 'src' : 'href'] = url;
		document.getElementsByTagName( 'head' )[0].appendChild(elem);
	},

	// 动态加载外部JavaScript文件
	loadScript: function(url, callback) {
		this._loadFile("js", url, callback);
	},

	// 动态加载外部CSS文件
	loadStyle: function(url, callback) {
		this._loadFile("css", url, callback);
	},

	// 动态加载JavaScript代码
	loadScriptString: function(code) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		try {
			script.appendChild(document.createTextNode(code));
		} catch (ex) {

			// IE
			script.text = code;
		}

		document.body.appendChild(script);
	},

	// 动态加载CSS代码
	loadStyleString: function(css) {
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

	// 向指定的样式表中添加样式规则
	// @example insertRult(document.styleSheets[0], "body", "background-color:
	// silver", 0);
	insertRule: function(sheet, selectorText, cssText, position) {
		if (sheet.insertRule) {
			sheet.insertRule(selectorText + "{" + cssText + "}", position);
		} else if (sheet.addRule) {
			sheet.addRule(selectorText, cssText, position);
		}
	},

	// 从样式表中删除规则
	// @example deleteRule(document.styleSheets[0], 0);
	deleteRule: function(sheet, index) {
		if (sheet.deleteRule) {
			sheet.deleteRule(index);
		} else if (sheet.removeRule) {
			sheet.removeRule(index);
		}
	},

	// 视图
	// ------------------------------------------------------------------

	// 确定给定的节点是否是另一个节点的后代
	// refNode: 参考节点
	// otherNode 要检查的节点
	// 需要client对象支持
	contains: function(refNode, otherNode) {
		if ( typeof refNode.contains == "function" && (!client.engine.webkit || client.engine.webkit >= 522)) {
			return refNode.contains(otherNode);
		} else if ( typeof refNode.compareDocumentPosition == "function") {
			return !!(refNode.compareDocumentPosition(otherNode) & 16);
		} else {
			var node = otherNode.parentNode;
			do {
				if (node === refNode) {
					return true;
				} else {
					node = node.parentNode;
				}
			} while (node !== null);
			return false;
		}
	},

	// 获取元素中包含的所有文本内容，包括子节点树中的所有文本，
	// 包含的文本将文档树中的所有文本拼接起来，由于不同浏览器处理空白符的方式不同，
	// 因此输出的文本可能会也可能不会包含原始HTML代码中的缩进。
	getInnerText: function(element) {
		return ( typeof element.textContent == "string") ? element.textContent : element.innerText;
	},

	// 设置元素的文本内容，该方法会移除先前存在的所有子节点，
	// 此外，还可以对所有出现在文本中的HTML语法字符进行编码，该方法还可过滤掉元素的HTML标签。
	setInnerText: function(element, text) {
		if ( typeof element.textContent == "string") {
			element.textContent = text;
		} else {
			element.innerText = text;
		}
	},

	// 获取框架的文档对象
	getDocument: function(iframe) {

		// 其他浏览器 || IE
		return iframe.contentDocument || iframe.contentWindow.document;
	},

	// 获取给定文档的窗口或者框架
	getWindow: function(document) {

		// 其他浏览器 || IE
		return document.defaultView || document.parentWindow;
	},

	// 获取元素左偏移量
	getElementLeft: function(element) {
		var actualLeft = element.offsetLeft;
		var current = element.offsetParent;

		while (current !== null) {
			actualLeft += current.offsetLeft;
			current = current.offsetParent;
		}

		return actualLeft;
	},

	// 获取元素上偏移量
	getElementTop: function(element) {
		var actualTop = element.offsetTop;
		var current = element.offsetParent;

		while (current !== null) {
			actualTop += current.offsetTop;
			current = current.offsetParent;
		}

		return actualTop;
	},

	// 获取浏览器视口的宽度和高度
	getViewport: function() {
		if (document.compatMode == "BackCompat") {
			return {
				width: document.body.clientWidth,
				height: document.body.clientHeight
			};
		} else {

			// CSS1Compat
			return {
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight
			};
		}
	},

	// 获取文档总高度
	// document.compatMode = "BackCompat"时，使用document.body代替document.documentElement
	getDocumentHeight: function() {
		return Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight);
	},

	// 获取文档总宽度
	getDocumentWidth: function() {
		return Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
	},

	// 将元素滚动回顶部
	scrollToTop: function(element) {
		if (element.scrollTop != 0) {
			element.scrollTop = 0;
		}
	},

	// 获取元素在页面中相对于视口的位置：（left, top, right, bottom）
	// 需要 getElementLeft 和 getElementTop 方法支持
	getBoundingClientRect: function(element) {

		var scrollTop = document.documentElement.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft;

		if (element.getBoundingClientRect) {
			if ( typeof arguments.callee.offset != "number") {
				var temp = document.createElement("div");
				temp.style.cssText = "position:absolute; left:0; top:0;";
				document.body.appendChild(temp);
				arguments.callee.offset = -temp.getBoundingClientRect().top - scrollTop;
				document.body.removeChild(temp);
				temp = null;
			}

			var rect = element.getBoundingClientRect();
			var offset = arguments.callee.offset;

			return {
				left: rect.left + offset,
				right: rect.right + offset,
				top: rect.top + offset,
				bottom: rect.bottom + offset
			};
		} else {

			var actualLeft = this.getElementLeft(element);
			var actualTop = this.getElementTop(element);

			return {
				left: actualLeft - scrollLeft,
				right: actualLeft + element.offsetWidth - scrollLeft,
				top: actualTop - scrollTop,
				bottom: actualTop + element.offsetHeight - scrollTop
			};
		}
	},

	// 表单相关
	// ------------------------------------------------------------------

	// 获取用户在文本框中选择的文本
	getSelectedText: function(textbox) {
		if ( typeof textbox.selectionStart === 'number') {
			return textbox.value.substring(textbox.selectionStart, textbox.selectionEnd);
		} else if (document.selection) {
			return document.selection.createRange().text;
		}
	},

	// 选择文本框的部分文本
	// startIndex 要选择的第一个字符的索引
	// stopIndex 要选择的最后一个字符之后的字符的索引，类似于substring方法的两个参数
	selectText: function(textbox, startIndex, stopIndex) {
		if (textbox.setSelectionRange) {
			textbox.setSelectionRange(startIndex, stopIndex);
		} else if (textbox.createTextRange) {
			var range = textbox.createTextRange();

			// 将范围折叠到文本框的开始位置
			range.collapse(true);

			// 将范围的起点移动到要选择的第一个字符的索引的位置
			// 此时，范围的起点和终点移动到了相同位置
			range.moveStart("character", startIndex);

			// 将范围的终点移动到起点之后的 stopIndex - startIndex 个字符
			range.moveEnd("character", stopIndex - startIndex);
			range.select();
		}
		textbox.focus();
	},

	// 获取多选select中选中的项
	getSelectedOptions: function(selectbox) {
		var result = [], option = null;

		for (var i = 0, len = selectbox.options.length; i < len; i++) {
			option = selectbox.options[i];
			if (option.selected) {
				result.push(option);
			}
		}
		return result;
	},

	addOption: function(selectbox, text, value) {
		var newOption = new Option(text, value);
		selectbox.add(newOption, undefined);
	},

	// 清除select元素中的所有项
	clearSelectbox: function(selectbox) {
		for (var i = 0, len = selectbox.options.length; i < len; i++) {
			selectbox.remove(0);
		}
	},

	// 序列化表单
	serialize: function(form) {
		var parts = [], field = null;

		for (var i = 0, len = form.elements.length; i < len; i++) {
			field = form.elements[i];

			if (!field.disabled) {
				switch (field.type) {
					case "select-one":
					case "select-multiple":
						for (var j = 0, optLen = field.options.length; j < optLen; j++) {
							var option = field.options[j];
							if (option.selected) {
								var optValue = "";
								if (option.hasAttribute) {
									optValue = (option.hasAttribute("value") ? option.value : option.text);
								} else {
									optValue = (option.attributes["value"].specified ? option.value : option.text);
								}
								parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(optValue));
							}
						}
						break;
					case undefined:
					case "file":
					case "submit":
					case "reset":
					case "button":
						break;

					case "radio":
					case "checkbox":
						if (!field.checked) {
							break;
						}

					default:
						parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
				}
			}

		}

		return parts.join("&");
	}

}; 