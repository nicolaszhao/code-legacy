var Dialog = require('dialog'),
	Data = require('app/data'),
	upload = require('app/widgets/upload');

require('jquery-plugins/jquery.placeholder');
require('jquery-plugins/jquery.validate');
require('jquery-plugins/additional-methods');

$.validator.addMethod('realname', function(value, element) {
	return this.optional(element) || /^[a-zA-Z\u4e00-\u9fa5]+$/.test(value);
});

$.validator.addMethod('realnamelength', function(value, element, params) {
	var getLength = function(value) {
		var chinese = value.match(/[\u4e00-\u9fa5]/g),
			ret = value.length;
		if (chinese) {
			ret = value.length - chinese.length + chinese.length * 2;
		}
		return ret;
	}, len = getLength(value);
	
	return this.optional(element) || (len >= params[0] && len <= params[1]);
});

$.validator.addMethod('mobile', function(value, element) {
	return this.optional(element) || /^1[34578]\d{9}$/.test(value);
});

var messages = {
	true_name: '请正确填写姓名，4-16个字符，中文或字母',
	mobile: '请正确填写手机号码',
	address: '请正确填写详细地址',
	email: '请正确填写邮箱'
};

var profile = {
	validate: function() {
		var that = this;
		
		this.validator = this.$form.validate({
			messages: messages,
			rules: {
				true_name: {
					realname: true,
					realnamelength: [4, 16]
				},
				mobile: {
					mobile: true
				}
			},
			showErrors: function(errorMap, errorList) {
				this.defaultShowErrors();
				
				$.each(errorList, function(i, item) {
					var $error = $(item.element).next('label.error');
					if ($error.length && !$error.find('.control-feedback-icon').length) {
						$error.prepend('<span class="control-feedback-icon"></span>');
					}
				});
			},
			success: function(label) {
				label.addClass('valid').prepend('<span class="control-feedback-icon"></span>');
			},
			submitHandler: function(form) {
				var changed = false;
				
				that.$form.find('.message-box').empty();
				that.$form.find('.input').each(function() {
					if (that.values[this.name] !== $(this).val()) {
						changed = true;
						return false;
					}
				});
				
				var localData = localStorage.getItem('luckyday');
		
				localData = JSON.parse(localData) || {};
				if (localData.optionSteps && !$('body').data('option-steps')) {
					$('body').data('option-steps', true);
				}
				
				if (changed) {
					that.$el.find(':submit').prop('disabled', true);
					
					Data.setUserinfo(that.$form.serialize())
						.done(function() {
							that.$el.dialog('close');
							
							if ($('body').data('option-steps')) {
								upload.open();
							}
						})
						.fail(function(error) {
							that.$form.find('.message-box').text(error);
						})
						.always(function() {
							that.$el.find(':submit').prop('disabled', false);
						});
				} else {
					that.$el.dialog('close');
					
					if ($('body').data('option-steps')) {
						upload.open();
					}
				} 
			}
		});
	},
	
	reset: function() {
		this.validator.resetForm();
		this.$form[0].reset();
		this.$form.find('.message-box').empty();
				
		if ($('html').hasClass('lte9')) {
			this.$form.find('.input').trigger('blur.placeholder');
		}
	},
	
	setUserData: function(data) {
		var key = md5('29988429c481f219b8c5ba8c071440e1' + this.$form.find('[name="sns"]').val() + data.userid);
		
		this.$form.find('[name="sns_id"]').val(data.userid).end()
			.find('[name="user_name"]').val(data.username).end()
			.find('[name="key"]').val(key);
	},
	
	updateTitle: function(state) {
		this.$el.find('.dialog-titlebar h2').text(state === 'add' ? '个人信息' : '修改个人信息');
	},
	
	open: function() {
		this.$el.dialog('open');
	},
	
	init: function(data) {
		var that = this;
		
		this.$el = $('#profile-dialog').dialog({
			open: function() {
				Data.getUserinfo({
					sns: that.$form.find('[name="sns"]').val(),
					sns_id: that.$form.find('[name="sns_id"]').val(),
					key: that.$form.find('[name="key"]').val()
				}).done(function(data) {
					if ($.type(data) === 'object') {
						that.$form.find('.input').each(function() {
							$(this).val(data[this.name]);
							that.values[this.name] = data[this.name];
						});
					}
				}).fail(function(error) {
					that.$form.find('.message-box').text(error);
				});
			},
			close: function() {
				that.reset();
				
				var localData = localStorage.getItem('luckyday');
				
				localData = JSON.parse(localData) || {};
				localData.optionSteps = false;
				localStorage.setItem('luckyday', JSON.stringify(localData));
			}
		});
		
		upload.init(data);
		
		this.$form = $('#profile-form');
		this.$form.find('.input').placeholder();
		
		this.values = {};
		this.$form.find('.input').each(function() {
			that.values[this.name] = this.value;
		});
		
		this.setUserData(data);
		this.validate();
		
		var localData = localStorage.getItem('luckyday');
		
		localData = JSON.parse(localData) || {};
		if (localData.optionSteps && !$('body').data('option-steps')) {
			this.open();
		}
	}
};

module.exports = profile;
