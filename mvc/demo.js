var pluginCollection, actionCollection, panesView,
	$body = $('body');

var rcontainslink = /^[^\{]*(?:\{([^\}]+)\}).*$/,
	rlinkplaceholder = /\{[^\}]+\}/,
	controlTypes = 'linkbutton button selectbox textbox link text'
		.split(' '),
	
	// 这里的控件是作为单独存在的控件，不需要被包裹等
	// 类型为 linkbutton或者link的话，可支持把'{}'内的字符串替换为link
	controlManager = {
		create: function(id, props) {
			var $control,
				type = props.type;
				
			switch (type) {
				case 'linkbutton':
					$control = $('<a href="#" data-id="' + id + '"></a>')
						.addClass('plugin-control plugin-control-linkbutton')
						.data('action', props.action);
						
					$control = controlManager.makeup($control, props);
					break;
					
				case 'button':
					$control = $('<a href="#" data-id="' + id + '"></a>')
						.addClass(props.classnames)
						.addClass('button plugin-control plugin-control-button')
						.text(props.label)
						.width(props.width)
						.data('action', props.action);
					break;
				
				case 'selectbox':
					$control = $('<select>', {
						'data-id': id
					})
						.addClass('plugin-control plugin-control-selectbox')
						.data('action', props.action);
					break;
					
				case 'textbox':
					$control = $('<input type="text" data-id="' + id + '">')
						.addClass(props.classnames)
						.addClass('textbox plugin-control plugin-control-textbox')
						.width(props.width)
						.data('action', props.action);
					break;
					
				case 'link':
					$control = $('<a>', {
						'href': props.url,
						'target': '_blank',
						'data-id': id
					})
						.addClass('plugin-control plugin-control-link');
						
					$control = controlManager.makeup($control, props);
					break;
				
				// text	
				default:
					$control = $('<span>', {
						'text': props.label,
						'class': props.classnames,
						'data-id': id
					})
						.addClass('plugin-control plugin-control-text');
			}
			
			controlManager.value($control, type, props.value);
			controlManager.disable($control, type, props.disabled);
			
			return $control;
		},
		
		makeup: function($control, props) {
			var match = rcontainslink.exec(props.label),
				$text, label;
			
			if (match && match[1]) {
				$control.text(match[1]);
				label = props.label.replace(rlinkplaceholder, '<a></a>');
				
				$text = $('<span>', {
					'class': props.classnames,
					'data-id': props.id
				})
					.html(label);
				
				$text
					.find('a')
					.replaceWith($control);
				
				$control = $text;
			} else {
				$control
					.text(props.label)
					.addClass(props.classnames);
			}
			
			return $control;
		},
		
		refresh: function($control, model, attrs) {
			var type = model.attributes.type;
			
			if (attrs.label) {
				if (type === 'linkbutton' || type === 'link') {
					$control.replaceWith(controlManager.create(model.id, model.attributes));
				} else if (type === 'button' || type === 'text') {
					$control.text(attrs.label);
				}
			}
			
			if (attrs.items) {
				if (type === 'selectbox') {
					$control.selectbox('option', {data: attrs.items})
						.selectbox('value', model.attributes.value);
				}
			}
			
			controlManager.value($control, type, attrs.value);
			controlManager.disable($control, type, attrs.disabled);
		},
		
		value: function($control, type, value) {
			if (typeof value !== 'undefined') {
				if (type === 'selectbox') {
					$control.selectbox('value', value);
				} else if (type === 'textbox') {
					$control.val(value);
				}
			}
		},
		
		disable: function($control, type, disabled) {
			if (typeof disabled === 'boolean') {
				if (type === 'selectbox') {
					$control.selectbox(disabled ? 'disable': 'enable');
				} else if (type === 'textbox') {
					$control.prop('disabled', disabled);
				} else if (type ==='button') {
					$control.toggleClass('button-disable plugin-state-disabled', disabled);
				}
			}
		}
	};
	
var ControlsView = View.extend({
	initialize: function() {
		this.listen('add', this.add);
		this.listen('remove', this.remove);
		this.listen('change', this.refresh);
	},
	
	render: function() {
		var that = this;
		
		_.each(this.collection.models, function(model) {
			that.add(model);
		});
		
		return this;
	},
	
	add: function(model) {
		var attrs = model.attributes,
			type = attrs.type,
			$control;
			
		$control = controlManager.create(model.id, attrs).appendTo(this.$el);
		if (type === 'selectbox') {
			$control.selectbox({
				data: attrs.items,
				width: attrs.width
			});
		}
	},
	
	remove: function(model) {
		var $control = this.$el.find('[data-id="' + model.id + '"]');
		
		if (model.attributes.type === 'selectbox') {
			$control.selectbox('destroy').remove();
		} else {
			$control.remove();
		}
		
		return $control;
	},
	
	refresh: function(model, attrs) {
		controlManager.refresh(this.$el.find('[data-id="' + model.id + '"]'), model, attrs);
	}
});

var OptionsView = View.extend({
	initialize: function() {
		this.listen('add', this.add);
		this.listen('remove', this.remove);
		this.listen('change', this.refresh);
	},
	
	render: function() {
		var that = this;
		
		_.each(this.collection.models, function(model) {
			that._add(model);
		});
		
		this._makeup();
		
		return this;
	},
	
	add: function(model) {
		this._add(model);
		this._makeup();
	},
	
	remove: function(model) {
		return this.$el.find('.plugin-option[data-id="' + model.id + '"]').remove();
	},
	
	refresh: function(model, attrs) {
		var type = model.attributes.type,
			$option = this.$el.find('.plugin-option[data-id="' + model.id + '"]'),
			$control = $option.find('[data-id="' + model.id + '"]');
		
		if ($.inArray(type, controlTypes) !== -1) {
			controlManager.refresh($control, model, attrs);
		} else {
			if (attrs.label && type === 'checkbox') {
				$control.find('.plugin-control-text').text(attrs.label);
			}
			
			if (attrs.items && type === 'radio') {
				this._radios($option, attrs.items, model);
				this._makeup();
			}
			
			this._value($option, type, attrs.value);
			this._disable($option, type, attrs.disabled);
		}
	},
	
	_add: function(model) {
		var $option, $control, $label, controls,
			attrs = model.attributes,
			type = attrs.type;
		
		if ($.inArray(type, controlTypes) !== -1) {
			$option = $('<div>', {
				'class': 'control-item plugin-option',
				'data-id': model.id
			});
				
			$control = controlManager.create(model.id, attrs).appendTo($option);
			if (type === 'selectbox') {
				$control.selectbox({
					data: attrs.items,
					width: attrs.width
				});
			}
		} else if (type === 'checkbox') {
			$option = $('<div>', {
				'class': 'control-item plugin-option',
				'data-id': model.id
			});
			
			$label = $('<label>', {
				'html': '<span class="plugin-control-text">' + attrs.label + '</span>',
				'for': model.id,
				'data-id': model.id,
				'class': 'checkbox-wrap plugin-control plugin-control-checkbox'
			})
				.data('action', attrs.action)
				.prepend('<i class="checkbox"><input type="checkbox" /></i>');
				
			$label.find('input')
				.attr('id', model.id);
				
			$option.append($label);
		} else if (type === 'radio') {
			$option = $('<ul>', {
				'class': 'plugin-option',
				'data-id': model.id
			});
			this._radios($option, attrs.items, model);
		}
		
		if ($option) {
			this._value($option, type, attrs.value);
			this._disable($option, type, attrs.disabled);
			
			$option.appendTo(this.$el);
			
			if (model.collection) {
				$option = type === 'radio' ? $option.find('li').eq(0) : $option;
				controls = new ControlsView({collection: model.collection, el: $option});
				controls.render();
			}
		}
	},
	
	_makeup: function() {
		var $options = this.$el.find('.control-item');
		
		if ($options.length) {
			$options.addClass('mb10')
				.last().removeClass('mb10');
		} else {
			this.$el.find('li').addClass('mb5')
				.last().removeClass('mb5');
		}
	},
	
	_value: function($option, type, value) {
		var $control = $option.find('label.plugin-control');
		
		if (type === 'checkbox' && $.type(value) === 'boolean') {
			$control.find('input').prop('checked', value);
		} else if (type ==='radio') {
			$control.find('input[value="' + value + '"]').prop('checked', true);
		}
	},
	
	_disable: function($option, type, disabled) {
		var $control = $option.find('label.plugin-control'),
			disable = function($el) {
				var $input = $el.find('input'),
					checked = $input.prop('checked');
				
				$input.prop('disabled', disabled);
				
				if (disabled) {
					$el.find('i').toggleClass(type + '-checked-disable', checked)
						.toggleClass(type + '-disable', !checked);
				} else {
					$el.find('i').removeClass(type + '-checked-disable')
						.removeClass(type + '-disable');
				}
			};
		
		if ($.type(disabled) === 'boolean') {
			if (type === 'checkbox') {
				disable($control);
			} else if (type === 'radio') {
				$control.each(function() {
					disable($(this));
				});
			}
		}
	},
	
	_radios: function($option, items, model) {
		var attrs = model.attributes;
		
		$option.empty();
		$.each(items, function(i, item) {
			var $label,
				$li = $('<li>'),
				id = model.id + '-' + (i + 1);
			
			$label = $('<label>', {
				'text': item.label,
				'for': id,
				'data-id': model.id,
				'class': 'radio-wrap plugin-control plugin-control-radio'
			})
				.data('action', attrs.action)
				.prepend('<i class="radio"><input type="radio" value="' + item.value + '" /></i>');
			
			$label.find('input')
				.attr('id', id)
				.attr('name', model.id);
				
			$li.append($label).appendTo($option);
		});
	}
});

var SectionsView = View.extend({
	initialize: function() {
		this.listen('add', this.add);
		this.listen('remove', this.remove);
		this.listen('change', this.refresh);
	},
	
	render: function() {
		var that = this;
		
		_.each(this.collection.models, function(model) {
			that.add(model);
		});
		
		return this;
	},
	
	add: function(model) {
		var $section, options,
			attrs = model.attributes;
		
		$section = $('<div>', {
			'class': 'setting-section plugin-section',
			'data-id': model.id
		})
			.append('<h2>' + attrs.title + '</h2>')
			.append('<div class="setting-content"></div>');
			
		$section.appendTo(this.$el);
		
		if (model.collection) {
			options = new OptionsView({collection: model.collection, el: $section.find('.setting-content')});
			options.render();
		}
	},
	
	remove: function(model) {
		return this.$el.find('.plugin-section[data-id="' + model.id + '"]').remove();
	},
	
	refresh: function(model, attrs) {
		if (attrs.title) {
			this.$el.find('.plugin-section[data-id="' + model.id + '"]')
				.find('h2').text(attrs.title);
		}
	}
});

var PanesView = View.extend({
	initialize: function() {
		this.listen('add', this.add);
		this.listen('remove', this.remove);
		this.listen('change', this.refresh);
	},
	
	events: {
		'click .plugin-control-linkbutton, .plugin-control-button': 'update',
		'change .plugin-control-selectbox': 'update',
		'focusout .plugin-control-textbox': 'update',
		'click .plugin-control-checkbox :checkbox, .plugin-control-radio :radio': 'update'
	},
	
	update: function(event) {
		var $el = $(this),
			postAction = function(id, value) {
				var attrs = actionCollection.get(id).attributes,
					data = {},
					value = $.type(value) !== 'undefined' ? value : true;
						
				data[attrs.pluginid] = {};
				data[attrs.pluginid][attrs.action] = {value: (value + '')};
				req.post(COMMANDS.DATA_UPDATE, [data]);
				
				$body.data('plugin-option-updating', true);
			};
		
		if ($el.is('.plugin-control-linkbutton') || $el.is('.plugin-control-button')) {
			event.preventDefault();
			if (!$el.hasClass('plugin-state-disabled')) {
				postAction($el.data('id'));
			}
		} else if ($el.is('.plugin-control-selectbox') || $el.is('.plugin-control-textbox')) {
			id = $el.data('id');
			postAction($el.data('id'), $el.val());
		} else if ($el.is(':checkbox')) {
			event.preventDefault();
			postAction($el.closest('.plugin-control').data('id'), $el.prop('checked'));
		} else if ($el.is(':radio')) {
			postAction($el.closest('.plugin-control').data('id'), $el.val());
		}
	},
	
	render: function() {
		var that = this;
		
		_.each(this.collection, function(model) {
			that.add(model);
		});
		
		return this;
	},
	
	add: function(model) {
		var $pane, $menu, index, sections,
			attrs = model.attributes,
			$tab = $('.side-menu'),
			$container = $('.card[data-id="' + attrs.paneid + '"]');
		
		if ($container.length) {
			$pane = $('<div>', {
				'class': 'plugin-pane',
				'data-id': model.id
			});
			
			$pane[attrs.position === 'top' ? 'prependTo' : 'appendTo']($container);
		} else {
			$pane = $('<div>', {
				'class': 'card hide plugin-pane',
				'data-id': model.id
			});
			
			$menu = $('<li>', {
				'class': 'plugin-menu',
				'data-id': model.id
			})
				.append('<a href="#' + model.id + '">' + attrs.label + '</a>');
			
			if ($.type(attrs.order) === 'number') {
				index = attrs.order - 1;
				if ($tab.find('li').eq(index).length) {
					$menu.insertAfter($tab.find('li').eq(index));
					$pane.insertAfter($('.card').eq(index));
				} else {
					$menu.appendTo($tab);
					$pane.insertAfter($('.card').last());
				}
			} else {
				$menu.appendTo($tab);
				$pane.insertAfter($('.card').last());
			}
		}
		
		if (model.collection) {
			sections = new SectionsView({collection: model.collection, el: $pane});
			sections.render();
		}
	},
	
	remove: function(model) {
		var $menu = this.$el.find('.plugin-menu[data-id="' + model.id + '"]'),
			$pane = this.$el.find('.plugin-pane[data-id="' + model.id + '"]'),
			method;
		
		if ($menu.hasClass('active')) {
			method = $menu.index() === 0 ? 'next' : 'prev';
			$menu[method]().addClass('active');
			$pane[method]().show();
		}
		
		$menu.remove();
		$pane.remove();
	},
	
	refresh: function(model, attrs) {
		if (attrs.label) {
			this.$el.find('.plugin-menu[data-id="' + model.id + '"]')
				.find('a').text(attrs.label);
		}
	}
});

var Controller = function() {
	var childCollectionTypes = 'sections options controls'.split(' '),
		
		// source: 子模块需要的数据集合
		// type: child collection type - sections | options | controls
		updateChildCollction = function(parentModel, source, type, parentid, pluginid) {
			var collection = [], 
				model, attrs, actionModel,
				hasChildModel;
			
			$.each(source, function(index, value) {
				attrs = {};
				
				// 如果是action模块，模块id是plugin id + action name
				attrs.id = value.action ?
					pluginid + '-' + value.action :
					parentid + '-' + type.charAt(0) + '-' + (value.type ? value.type + '-' : '') + (index + 1);
					
				attrs.parentid = parentid;
				attrs.pluginid = pluginid;
				
				// 需要对已有模块进行更新
				model = parentModel.collection.get(attrs.id);
				if (!model) {
					model = new Model();
				}
				hasChildModel = cloneAttributes(attrs, value, model, pluginid);
				
				// 如果是模块更新，且原来有子集合，现在可能没有了，这时需要清除掉
				if (!hasChildModel && model.collection.length) {
					model.collection.clear();
				}
				
				if (attrs.action) {
					
					// 为了达到action model与视图模块共享，需要将已有的action model的属性更新到视图模块
					// 然后将原先的action model替换为视图模块
					actionModel = actionCollection.get(attrs.id);
					if (actionModel) {
						model.set(actionModel.attributes);
						actionCollection.remove(actionModel);
					}
					actionCollection.add(model);
				}
				
				model.set(attrs);
				collection.push(model);
			});
			
			parentModel.collection.set(collection);
		},
		
		cloneAttributes = function(target, source, model, pluginid) {
			var type, typeIndex,
				hasChildModel = false;
			
			if (!model.collection) {
				model.collection = new Collection();
			}
			
			$.each(source, function(key, val) {
				typeIndex = $.inArray(key, childCollectionTypes);
				
				if (typeIndex === -1) {
					target[key] = val;
				} else {
					if ($.type(val) === 'array' && val.length) {
						type = childCollectionTypes[typeIndex];
						updateChildCollction(model, val, type, target.id, pluginid);
						hasChildModel = true;
					}
				}
			});
			
			return hasChildModel;
		},
		
		updateViews = function(data) {
			var collection = [],
				model, attrs;
			
			$.each(data, function(id, values) {
				attrs = {};
				attrs.id = id;
				model = pluginCollection.get(id);
				if (!model) {
					model = new Model();
				}
				cloneAttributes(attrs, values, model, id);
				model.set(attrs);
				collection.push(model);
			});
			pluginCollection.set(collection);
		},
	
		updateValues = function(data) {
			var model, attrs;
			
			$.each(data, function(id, actions) {
				$.each(actions, function(key, values) {
					attrs = {};
					
					// action 模块需要plugin + action name
					attrs.id = id + '-' + key;
					
					attrs.pluginid = id;
					model = actionCollection.get(attrs.id);
					if (!model) {
						attrs = _.assign(attrs, values);
						model = new Model(attrs);
						actionCollection.add(model);
					} else {
						model.set(values);
					}
				});
			});
		};
	
	return {
		start: function() {
			pluginCollection = new Collection();
			actionCollection = new Collection();
			panesView = new PanesView({collection: pluginCollection, el: 'body'});
			
			req.post(COMMANDS.VIEW_OBSERVE, function(cmd, res) {
				if (res.error === 0) {
					updateViews(res.body);
				}
			});
			
			req.post(COMMANDS.DATA_OBSERVE, function(cmd, res) {
				if (res.error === 0) {
					updateValues(res.body);
					
					if ($body.data('plugin-option-updating')) {
	                    $body.data('plugin-option-updating', false);
	                    alertTip.success('设置已保存');
	                }
				}
			});
		}
	};
};

Controller.start();