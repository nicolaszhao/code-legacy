var Dialog = require('dialog'),
	Data = require('app/data');
	
var __Rep__ = require('app/reporter');

require('jquery-plugins/jquery.ui.widget');
require('jquery-plugins/jquery.iframe-transport');
require('jquery-plugins/jquery.fileupload');

var UPLOAD_URL = 'http://mams.br.baidu.com/luckyday/upload.php';

var messages = {
	filename: {
		required: '请选择文件',
		extension: '文件格式应为png或gif'
	},
	work_name: '作品名称字数为4-16个字符',
	description: '作品说明字数限制为100字'
};

var createObjectURL = function(file) {
	if (window.URL) {
		return window.URL.createObjectURL(file);
	} else if (window.webkitURL) {
		return window.webkitURL.createObjectURL(file);
	} else {
		return null;
	}
};

var upload = {
	validate: function() {
		var that = this;
		
		this.validator = this.$form.validate({
			messages: messages,
			rules: {
				filename: {
					extension: 'png|gif'
				}
			},
			errorPlacement: function(error, element) {
				if (element.attr('name') === 'filename') {
					error.insertAfter(element.parent());
				} else {
					error.insertAfter(element);
				}
			},
			submitHandler: function(form) {
				var $img = that.$form.find('.file-preview-content img');
				
				that.$form.find('.message-box').empty();
				if ($img.length && $img.data('size')) {
					if (that.validImageSize($img)) {
						that.$form.find(':submit').prop('disabled', true);
						that.uploadData.submit();
					}
				} else {
					that.$form.find(':submit').prop('disabled', true);
					that.uploadData.submit();
				}
				
				__Rep__.formUploadClick();
			}
		});
	},
	
	reset: function() {
		this.$form[0].reset();
		this.validator.resetForm();
		this.$form.find('.message-box').empty();
		
		this.$form.find('.upload-progressbar')
			.find('.upload-progressbar-value').width(0)
			.find('.upload-progressbar-tips').text('');
			
		this.$form.find('.file-preview-content').empty();
		
		if ($('html').hasClass('lte9')) {
			this.$form.find('.input').trigger('blur.placeholder');
		}
	},
	
	open: function() {
		this.$el.dialog('open');
	},
	
	setUserData: function(data) {
		this.$form.find('[name="sns_id"]').val(data.userid).end()
			.find('[name="user_name"]').val(data.username);
			
	},
	
	events: function() {
		var that = this;
		
		this.$form.find('#chk-protocol').on('click', function() {
			var checked = $(this).prop('checked');
			that.$form.find(':submit').prop('disabled', !checked);
		});
	},
	
	validImageSize: function($img) {
		var $file = this.$form.find('[name="filename"]'),
			sizes = ['540*258', '270*129'],
			$error, size, ret = true;
		
		size = $img.data('size');
		
		if ($file.valid()) {
			if ($.inArray(size, sizes) === -1) {
				$error = $file.parent().next('label.error');
				if (!$error.length) {
					$error = $('<label />', {
						'class': 'error',
						id: $file.attr('id') + 'error',
						'for': $file.attr('id')
					})
						.insertAfter($file.parent());
				}
				
				$file.addClass('error');
				$error.show().text('PNG尺寸为540x258px，GIF尺寸为270×129px');
				ret = false;
			}
		}
		
		return ret;
	},
	
	init: function(userdata) {
		var that = this;
		
		this.$el = $('#upload-dialog').dialog({
			open: function() {
				that.reset();
				that.$form.find(':submit').prop('disabled', !that.$form.find('#chk-protocol').prop('checked'));
				
				Data.getSchedule().done(function(data) {
					var curId = _.findWhere(data, {current: '1'}).id;
					that.$form.find('[name="schedule_id"]').val(curId);
				});
				
				that.setUserData(userdata);
			}
		});
		
		this.$error = $('#upload-error-dialog').dialog({
			ok: function() {
				__Rep__.reuploadClick();
			}
		});
		
		this.$form = $('#upload-form');
		this.$form.find('.input').placeholder();
		
		this.$form.find('#txt-file').fileupload({
			url: UPLOAD_URL,
			dataType: 'json',
			dropZone: null,
			pasteZone: null,
			autoUpload: false,
			redirect: /^(https?:\/\/[^/]+\/(?:[^/]+\/)*)/.exec(location.href)[1] + 'result.html?%s',
			formData: function() {
				return that.$form.serializeArray();
			},
			add: function(event, data) {
				that.uploadData = data;
			},
			change: function(event, data) {
				var file = data.files[0],
					url = createObjectURL(file);
					
				that.$form.find('[name="filename"]').val(file.name).valid();
				
				if (url) {
					$('<img src="' + url + '" />').on('load', function() {
						$(this).data('size', this.width + '*' + this.height);
						that.$form.find('.file-preview-content').empty()
							.append(this);
					});
				}
			},
			start: function() {
				that.$form.find('.upload-progressbar')
					.find('.upload-progressbar-value').width(0)
					.find('.upload-progressbar-tips').text('');
					
				if ($('html').hasClass('lte9')) {
					that.$form.find('.upload-progressbar').find('.upload-progressbar-icon').show();
				}
			},
			progressall: function(event, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				
				that.$form.find('.upload-progressbar')
					.find('.upload-progressbar-value').width(progress + '%')
					.find('.upload-progressbar-tips').text(progress + '%');
			},
			done: function(event, data) {
				var file;
				
				that.$form.find('.upload-progressbar').find('.upload-progressbar-icon').hide();
				
				file = data.result.files[0];
				
				if (file.error) {
					that.$form.find(':submit').prop('disabled', false);
					that.$form.find('.message-box').text(file.error);
					that.$error.dialog('open');
				} else {
					if ($('html').hasClass('lte9')) {
						that.$form.find('.file-preview-content').empty().append('<img src="' + file.url + '" />');
						setTimeout(function() {
							location.href = 'my-works.html';
						}, 2000);
					} else {
						location.href = 'my-works.html';
					}
				}
			}
		});
		
		
		this.validate();
		this.events();
	}
};

module.exports = upload;
