
// 用户模块的常用提示信息
var userMessages = {
	
	username: {
		help: '请输入长度为6-25的用户名',
		required: '请输入用户名',
		usernameLength: '请输入长度为{0}-{1}的用户名',
		username: '用户名包含非法字符，请重新输入',
		exist: '用户名已被注册',
		invalid: '用户名或密码错误'
	},
	
	password: {
		help: '请输入6-16个字符组成',
		required: '请输入密码',
		minlength: '您输入的密码过短',
		maxlength: '您输入的密码过长',
		containUsername: '登录密码与用户名相似，请更换'
	},
	
	passwordConfirm: {
		help: '请再次输入密码',
		required: '请再次输入密码',
		equalTo: '两次输入密码不一致'
	},
	
	passwordRetrieve: {
		help: '请输入旧密码',
		required: '请输入旧密码',
		invalid: '旧密码不正确'
	},
	
	email: {
		help: '请输入您的邮箱，方便日后找回密码。',
		required: '请输入认证邮箱。',
		email: '请输入正确格式的邮箱。',
		exist: '邮箱已被占用，请更换。'
	},
	
	captcha: {
		help: '请输入认证码。',
		required: '请输入认证码。',
		invalid: '认证码不正确，请重新输入。'
	}
};
