var slice = Array.prototype.slice,
	rboolean = /^(?:true|false)$/;

var extend = function(protoProps, staticProps) {
	var parent = this;
	var child;
	
	if (protoProps && _.has(protoProps, 'constructor')) {
		child = protoProps.constructor;
	} else {
		child = function() {
			return parent.apply(this, arguments);
		};
	}
	
	_.extend(child, parent, staticProps);
	
	var Surrogate = function() {
		this.constructor = child;
	};
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate;
	
	if (protoProps)
		_.extend(child.prototype, protoProps);
	
	child.__super__ = parent.prototype;

	return child;
}; 

var Model = function(attributes) {
	this.attributes = {};
	this._callbacks = {};
	
	this.set(attributes);
	this.initialize();
};

Model.prototype = {
	constructor: Model,
	
	initialize: function() {},
	
	idAttribute: 'id',
	
	set: function(attribute, value) {
		var that = this,
			changed = 0,
			changedAttrs = {};
		
		if (_.isPlainObject(attribute)) {
			_.each(attribute, function(val, attr) {
				if (!_.isEqual(that.attributes[attr], val)) {
					val = that.parseBoolean(val);
					that.attributes[attr] = val;
					that.trigger('change:' + attr, that, val);
					changedAttrs[attr] = val;
					changed++;
				}
			});
		} else {
			if (!_.isEqual(this.attributes[attribute], value)) {
				value = this.parseBoolean(value);
				this.attributes[attribute] = value;
				this.trigger('change:' + attribute, this, value);
				changedAttrs[attribute] = value;
				changed++;
			}
		}
		
		if (typeof this.id === 'undefined' && this.idAttribute in this.attributes) {
			this.id = this.attributes[this.idAttribute];
		}
		
		if (changed) {
			this.trigger('change', this, changedAttrs);
		}
	},
	
	get: function(attribute) {
		return this.attributes[attribute];
	},
	
	on: function(type, callback) {
		this._callbacks[type] = callback;
	},
	
	trigger: function(type) {
		var args = slice.call(arguments, 1);
		
		if (this._callbacks[type]) {
			this._callbacks[type].apply(this, args);
		}
	},
	
	toJSON: function() {
		return this.attributes;
	},
	
	// 在从客户端获取的值中，有些boolean会是"true"或"false"的字符串，所以需要转义成正确的值
	parseBoolean: function(value) {
		return typeof value === 'string' && rboolean.test(value) ? 
			JSON.parse(value) : value;
	}
};

var Collection = function(models) {
	this.models = [];
	this.length = 0;
	this._callbacks = {};
	this._modelCallbacks = [];
	this._callbackNames = 'add remove';
	
	this.set(models);
	this.initialize();
};

Collection.prototype = {
	constructor: Collection,
	
	initialize: function() {},
	
	_createModel: function(model) {
		if (!(model instanceof this.model)) {
			model = new this.model(model);
		}
		return model;
	},
	
	model: Model,
	
	add: function(models) {
		var that = this, found;
		
		models = _.isArray(models) ? models : [models];
		_.each(models, function(model) {
			model = that._createModel(model);
			
			found = _.findIndex(that.models, function(ownModel) {
				return ownModel.id === model.id;
			});
			
			if (found !== -1) {
				that.models[found].set(model.attributes);
			} else {
				that.models.push(model);
				that.length++;
				that.trigger('add', model);
				
				// 对新增模型重新绑定之前已绑定的事件
				_.each(that._modelCallbacks, function(event) {
					model.on(event.type, event.callback);
				});
			}
		});
	},
	
	// id: 可以是模块对象或者模块的id
	remove: function(id) {
		var that = this,
			found, model;
		
		if (id instanceof this.model) {
			id = id.id;
		}
		
		found = _.findIndex(this.models, function(ownModel) {
			return ownModel.id === id;
		});
			
		if (found !== -1) {
			model = this.models.splice(found, 1)[0];
			this.length--;
			this.trigger('remove', model);
		}
	},
	
	clear: function() {
		var len = this.length,
			model;
		
		while(len--) {
			model = this.models.splice(len, 1)[0];
			this.trigger('remove', model);
		}
		this.length = 0;
	},
	
	// 该方法将更新集合中的所有模块，把已存在的进行更新，不存在的删除，并加上新增的模块
	set: function(models) {
		var that = this,
			found = -1,
			dels = [],
			model, len;
		
		models = (_.isArray(models) ? 
			models : 
			(models instanceof this.model || _.isPlainObject(models) ? 
				[models] : 
				[]));
			
		if (!models.length) {
			return;
		}
		
		models = _.map(models, function(model) {
			return that._createModel(model);
		});
		
		_.each(this.models, function(ownModel, i) {
			found = _.findIndex(models, function(model) {
				return ownModel.id === model.id;
			});
			
			if (found === -1) {
				dels.push(i);
			}
		});
		
		len = dels.length;
		
		while (len--) {
			model = this.models.splice(dels[len], 1)[0];
			this.length--;
			this.trigger('remove', model);
		}
		
		this.add(models);
	},
	
	get: function(id) {
		var ret;
		
		_.each(this.models, function(model) {
			if (model.id === id) {
				ret = model;
				return false;
			}
		});
		
		return ret;
	},
	
	on: function(type, callback) {
		if (this._callbackNames.indexOf(type) !== -1) {
			this._callbacks[type] = callback;
			return;
		}
		
		this._modelCallbacks.push({type: type, callback: callback});
		_.each(this.models, function(model) {
			model.on(type, callback);
		});
	},
	
	trigger: function(type) {
		var args = slice.call(arguments);
		
		if (this._callbacks[type]) {
			this._callbacks[type].apply(this, args.slice(1));
			return;
		}
		
		_.each(this.models, function(model) {
			model.trigger.apply(model, args);
		});
	},
	
	toJSON: function() {
		return _.map(this.models, 'attributes');
	}
};

var View = function(options) {
	this.options = _.assign(this._defaultOptions, options);
	this.collection = this.options.collection;
	this.model = this.options.model;
	
	this._setElement();
	
	this.initialize();
	this.delegateEvents();
};

View.prototype = {
	constructor: View,
	
	initialize: function() {},
	
	_defaultOptions: {
		el: '<div>'
	},
	
	_setElement: function() {
		this.el = this.options.el;
		this.$el = $(this.el);
	},
	
	// 绑定到当前视图元素的事件委托集合
	// {'event-name selector', method}
	// method: 匿名函数或者视图方法
	events: {},
	
	render: function() {
		return this;
	},
	
	remove: function() {
		this.$el.remove();
	},
	
	delegateEvents: function() {
		var delegateEventSplitter = /^(\S+)\s*(.*)$/,
			that = this;
		
		this.undelegateEvents();
		_.each(this.events, function(method, key) {
			var match = key.match(delegateEventSplitter), 
				eventName = match[1], selector = match[2];
			
			if (!_.isFunction(method)) {
				method = that[method];
			}
			
			eventName += '.delegateEvents';
			if (selector) {
				that.$el.on(eventName, selector, method);
			} else {
				that.$el.on(eventName, method);
			}
		});
	},
	
	undelegateEvents: function() {
		this.$el.off('.delegateEvents');
	},
	
	// 绑定事件到视图的集合模型中
	// 支持: change|change:attribute, add, remove
	listen: function(type, callback) {
		this.collection.on(type, _.bind(callback, this));
	}
};

Model.extend = Collection.extend = View.extend = extend;
