$.validator.addMethod('phoneZHCN', function(value, element) {
	return this.optional(element) || /^1[1-9][0-9]{9}$/.test(value);
});

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


// 输入提示、输入错误，输入正确的设置class name方法
$.validator.setDefaults({
	focusInvalid: false,
	errorClass: 'state-error',
	validClass: 'state-success',
	success: 'state-success'
});

// 对中文字符进行单文字为2个字符的判断
$.validator.addMethod('usernameLength', function(value, element) {
	var getLength = function(value) {
		var chinese = value.match(/[\u4e00-\u9fa5]/g),
			ret = value.length;
		if (chinese) {
			ret = value.length - chinese.length + chinese.length * 2;
		}
		return ret;
	}, len = getLength(value);
	
	return this.optional(element) || (len >= 6 && len <= 25);
});

// 验证有效的用户名
$.validator.addMethod('username', function(value, element) {
	return this.optional(element) || /^[a-zA-Z\d\u4e00-\u9fa5]+$/.test(value);
});

// 验证密码中是否包含用户名
$.validator.addMethod('containUsername', function(value, element, params) {
	var username = $.trim( $(params).val() ), ret;
	ret = value.indexOf(username) === -1;
	if (!username) {
		ret = true;
	}
	return this.optional(element) || ret;
});