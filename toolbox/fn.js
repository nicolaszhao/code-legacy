/*
 * 高级方法
 * date: Sep 24th, 2012
 */
var fn = {
	// 用于事件处理程序及 setTimeout() 和 setInterval()
	// 在用于事件处理时，可以传入除Event对象外的额外参数
	// 被ECMAScript5原生支持
	bind: function(fn, context) {
		var args = Array.prototype.slice.call(arguments, 2);

		return function() {
			var innerArgs = Array.prototype.slice.call(arguments), finalArgs = args.concat(innerArgs);

			return fn.apply(context, finalArgs);
		};
	},

	// 任务分割函数，当一个函数运行时间过长，可以使用该函数把它拆分为一系列能在较短时间内完成的子函数，使用定时器加入到队列。
	chunk: function(array, process, context) {
		var tasks = array.concat(), item;

		setTimeout(function() {
			item = tasks.shift();
			process.call(context, item);

			if (tasks.length) {
				setTimeout(arguments.callee, 100);
			}
		}, 100);
	},

	// 使某些代码在没有间断的情况下连续重复执行时，使用定时器进行节流控制。
	throttle: function(method, context) {
		clearTimeout(method.tId);

		method.tId = setTimeout(function() {
			method.call(context);
		}, 100);
	},

	/**
	 * 获取客户端数据存储对象
	 * clear()：删除所有值；
	 * getItem(name)：获取指定名字的对应的值；
	 * key(index)：获取指定数字索引的该位置名字；
	 * removeItem(name)：删除由名字指定的名-值对；
	 * setItem(name, value)：设置与指定名字的对应的值。
	 *
	 * 也可以直接使用属性方式直接获取和设置值
	 * @example
	 * var storage = getLocalStorage();
	 * storage.name = "nicolas";
	 * alert(storage.name);
	 */
	getLocalStorage: function() {

		// HTML5的客户端存储持久化数据方案
		if ( typeof localStorage == "object") {
			return localStorage;
		} else if ( typeof globalStorage == "object") {
			return globalStorage[location.host];
		} else {
			throw new Error("Local storage not available.");
		}
	},

	/**
	 * 缓存一个函数的计算结果供后续计算使用
	 * fundamental 一个需要增加缓存功能的函数
	 * cache 一个可选的缓存对象，如果你需要预设一些值，就给缓存对象传入一个预设的缓存对象，否则会创建一个新的缓存对象
	 * @example var memfactorial = memoize(factorial, {"0": 1, "1": 1}); var fact6 =
	 * memfactorial(6);
	 */
	memoize: function(fundamental, cache) {
		cache = cache || {};

		var shell = function(arg) {
			if (!cache.hasOwnProperty(arg)) {
				cache[arg] = fundamental(arg);
			}
			return cache[arg];
		};

		return shell;
	},
	
	isSupportFixed : function() {
		var outer = document.createElement('div'), 
			inner = document.createElement('div'),
			ret = true;

		outer.style.position = 'absolute';
		outer.style.top = '200px';

		inner.style.position = 'fixed';
		inner.style.top = '100px';

		outer.appendChild(inner);
		document.body.appendChild(outer);

		if (inner.getBoundingClientRect && 
				inner.getBoundingClientRect().top === outer.getBoundingClientRect().top) {
			
			ret = false;
		}
		
		document.body.removeChild(outer);
		return ret;
	},

	// get the product from 1 to 'num'
	factorial: function(n) {
		if (n <= 1) {
			return 1;
		} else {
			return n * arguments.callee(n - 1);
		}
	},

	// 返回介于lowerValue到upperValue之间的一个随机数
	selectFrom: function(lowerValue, upperValue) {
		var choices = upperValue - lowerValue + 1;
		return Math.floor(Math.random() * choices + lowerValue);
	},

	// 验证给定的数据对象是否为数组类型
	isArray: function(value) {
		return value && typeof value === 'object' && typeof value.length === 'number' && typeof value.splice === 'function' && !(value.propertyIsEnumerable('length'));
	},

	// 数组排序，作为数组 sort() 方法的参数使用
	compair: function(a, b) {
		if (a === b) {
			return 0;
		}
		if ( typeof a === typeof b) {
			return a < b ? -1 : 1;
		}
		return typeof a < typeof b ? -1 : 1;
	},

	// 在一定时间（毫秒）内批量处理数据量比较大的数组，以减轻运行大数据数组对客户端的程序阻塞
	timedProcessArray: function(items, process, callback) {
		var todo = items.concat();

		setTimeout(function() {
			var start = +new Date();

			do {
				process(todo.shift());
			} while (todo.length > 0 && (+new Date() - start < 50));

			if (todo.length > 0) {
				setTimeout(arguments.callee, 25);
			} else {
				callback(items);
			}
		}, 25);
	},

	integer: function(num) {
		return Math[num < 0 ? 'ceil' : 'floor'](num);
	}

};
