/*
 * 事件
 * date: Sep 10th, 2012
 */
var __event__ = {

	// COMContentLoaded事件
	ready: function(start) {
		if (document.addEventListener) {
			this.add(document, 'DOMContentLoaded', start);

		} else if (document.attachEvent) {
			this.add(document, 'readystatechange', function() {
				if (document.readyState === 'interactive' || document.readyState === 'complete') {
					this.remove(document, 'readystatechange', arguments.callee);
					start();
				}
			});
		}
	},

	add: function(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent) {
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
		}
	},

	remove: function(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent) {
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	},

	getEvent: function(event) {
		return event || window.event;
	},

	getTarget: function(event) {
		return event.target || event.srcElement;
	},

	// 在执行mouseover和mouseout事件时，鼠标指针从一个元素的边界之内移动到另一个元素的边界内
	// 对mouseover而言，事件的主目标是获得光标的元素，而相关元素就是那个失去光标的元素
	// 对mouseout，事件的主目标是失去光标的元素，而相关元素是获得光标的元素
	// 该属性就是这个相关元素
	getRelatedTarget: function(event) {
		if (event.relatedTarget) {
			return event.relatedTarget;
		} else if (event.toElement) {
			return event.toElement;
		} else if (event.fromElement) {
			return event.fromElement;
		} else {
			return null;
		}
	},

	getPageX: function(event) {
		var pageX = event.pageX;
		if (pageX === undefined) {
			pageX = event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft );
		}
		return pageX;
	},

	getPageY: function(event) {
		var pageY = event.pageY;
		if (pageY === undefined) {
			pageY = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop );
		}
		return pageY;
	},

	// 获取鼠标按键（0：左键，1：中间键，2：右键）
	getButton: function(event) {
		if (document.implementation.hasFeature("MouseEvents", "2.0")) {
			return event.button;
		} else {
			switch (event.button) {
				case 0:
				case 1:
				case 3:
				case 5:
				case 7:
					return 0;
				case 2:
				case 6:
					return 2;
				case 4:
					return 1;
			}
		}
	},

	// 鼠标滚轮mousewheel，或DOMMouseScroll（Firefox）事件对象的属性
	// 向前滚动鼠标滚轮：120，向后滚动滚轮：-120
	// 需要client对象支持
	getWheelDelta: function(event) {
		if (event.wheelDelta) {
			return (client.engine.opera && client.engine.opera < 9.5 ? -event.wheelDelta : event.wheelDelta);
		} else {
			return -event.detail * 40;
		}
	},

	// 在keypress事件时，该属性值为按下键所代表字符的ASCII编码
	// 此时，keycode通常等于0或等于所按键的键码
	// IE和Opera在keycode中保存字符的ASCII编码
	getCharCode: function(event) {
		if ( typeof event.charCode == "number") {
			return event.charCode;
		} else {
			return event.keyCode;
		}
	},

	preventDefault: function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},

	stopPropagation: function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	},

	// 从剪贴板中取得文本，
	// 支持IE, Safari, Chrome
	getClipboardText: function(event) {
		var clipboardData = event.clipboardData || window.clipboardData;
		if (clipboardData) {
			return clipboardData.getData("text");
		} else {
			throw new Error("当前浏览器不支持clipboardData对象，无法操作剪贴板中的数据。");
		}
	},

	// 将文本添加到剪贴板中，
	// 支持IE, Safari, Chrome
	// 成功将数据存入剪贴板后，返回true，否则返回false
	setClipboardText: function(event, value) {
		if (event.clipboardData) {
			return event.clipboardData.setData("text/plain", value);
		} else if (window.clipboardData) {
			return window.clipboardData.setData("text", value);
		} else {
			throw new Error("当前浏览器不支持clipboardData对象，无法操作剪贴板中的数据。");
		}
	}

};

var EventTarget = function() {
	this.handlers = {};
};

EventTarget.prototype = {
	constructor: EventTarget,
	addHandler: function(type, handler) {
		if ( typeof this.handlers[type] == 'undefined') {
			this.handlers[type] = [];
		}

		this.handlers[type].push(handler);
	},
	removeHandler: function(type, handler) {
		var handlers, i, len;

		if (this.handlers[type] instanceof Array) {
			handlers = this.handlers[type];
			for ( i = 0, len = handlers.length; i < len; i++) {
				if (handlers[i] === handler) {
					break;
				}
			}

			handlers.splice(i, 1);
		}
	},
	fire: function(event) {
		var handlers, i, len;

		if (!event.target) {
			event.target = this;
		}
		if (this.handlers[event.type] instanceof Array) {
			handlers = this.handlers[event.type];
			for ( i = 0, len = handlers.length; i < len; i++) {
				handlers[i](event);
			}
		}
	}

};

var eventuality = function(that) {
	var registry = {};

	// 注册一个事件。构造一条处理程序条目。将它插入到处理程序数组中，
	// 如果这种类型的事件还不存在，就构造一个。
	that.on = function(type, method, parameters) {
		var handler = {
			method: method,
			parameters: parameters
		};

		if ( typeof registry[type] === 'undefined') {
			registry[type] = [];
		}
		registry[type].push(handler);

		return this;
	};

	// 在一个对象上触发一个事件。该事件可以是一个包含事件名称的字符串，
	// 或者是一个拥有包含事件名称的type属性的对象。
	// 通过"on"方法注册的事件处理程序中匹配事件名称的函数将被调用
	that.fire = function(event) {
		var type = typeof event === 'string' ? event : event.type, array, func, handler, i;

		// 如果这个事件存在一组事件处理程序，那么就遍历它们并按顺序依次执行。
		if (registry.hasOwnProperty(type)) {
			array = registry[type];
			for ( i = 0; i < array.length; i++) {
				handler = array[i];

				// 每个处理程序包含一个方法和一组可选的参数。
				// 如果该方法是一个字符串形式的名字，那么寻找到该函数。
				func = handler.method;
				if ( typeof func === 'string') {
					func = this[func];
				}

				// 调用一个处理程序。如果该条目包含参数，那么传递它们过去。否则，传递该事件对象。
				func.apply(this, handler.parameters || [event]);
			}
		}
		return this;
	};

	return that;
};

// 需要eventBox, EventTarget对象支持
var DragDrop = function(element) {
	var dragdrop = new EventTarget(), dragging = null, diffX = 0, diffY = 0, handles;

	handles = {
		dragStart: function(x, y) {
			element.style.position = 'absolute';
			dragging = element;

			diffX = x - element.offsetLeft;
			diffY = y - element.offsetTop;

			dragdrop.fire({
				type: 'dragstart',
				target: dragging,
				x: y,
				y: y
			});
		},

		drag: function(x, y) {
			if (dragging !== null) {
				dragging.style.left = x - diffX + 'px';
				dragging.style.top = y - diffY + 'px';

				dragdrop.fire({
					type: 'drag',
					target: dragging,
					x: x,
					y: y
				});
			}
		},

		dragEnd: function(x, y) {
			dragdrop.fire({
				type: 'dragend',
				target: dragging,
				x: x,
				y: y
			});

			dragging = null;
		}

	};

	var handle = function(e) {
		e = eventBox.getEvent(e);

		var x = e.clientX, y = e.clientY;

		switch (e.type) {
			case 'mousedown':
				eventBox.preventDefault(e);
				handles.dragStart(x, y);
				break;

			case 'mousemove':
				handles.drag(x, y);
				break;

			case 'mouseup':
				handles.dragEnd(x, y);
				break;
		}
	};

	dragdrop.enable = function() {
		eventBox.add(element, 'mousedown', handle);
		eventBox.add(element, 'mousemove', handle);
		eventBox.add(element, 'mouseup', handle);
	};

	dragdrop.disabled = function() {
		eventBox.remove(element, 'mousedown', handle);
		eventBox.remove(element, 'mousemove', handle);
		eventBox.remove(element, 'mouseup', handle);
	};

	return dragdrop;
}; 