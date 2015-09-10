/**
 * Chinese ID Card
 * @author Nicolas.Z
 * date: 2011-2-25
 */
var chineseIdCard = {

    isValidFormat: function(val){
        return /(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(val);
    },
	
    zeroPad: function(num){
        var s = '0' + num;
        return s.substring(s.length - 2)
    },
	
    /**
     * format: 'mm/dd/yyyy'
     * @param {Date} date
     */
    dateObjectToString: function(date){
        var a = [];
        a[0] = this.zeroPad(date.getMonth() + 1);
        a[1] = this.zeroPad(date.getDate());
        a[2] = date.getFullYear();
        
        return a.join("/");
    },
    
    /**
     * 返回传入的身份证号字符串中的出生日期的有效性
     * 如果传入第2个参数，需判断跟它是否相同，常用于有出生日期选项的页面
     * @param {String} val 身份证号字符串
     * @param {String} date 日期字符串，日期格式：'mm/dd/yyyy'
     * @return {Boolean}
     */
    isValidBirthday: function(val, date){
        val = val.toUpperCase();
        var len = val.length;
        if (!this.isValidFormat(val)) {
            return false;
        }
        var pattern = (len == 15 ? /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/ : /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
        var match = val.match(pattern);
        var birthday = match[3] + "/" + match[4] + "/" + (len == 15 ? "19" + match[2] : match[2]);
        if (this.dateObjectToString(new Date(birthday)) != birthday) {
            return false;
        }
        if (typeof date == "string") {
            return date == birthday;
        }
        return true;
    },
    
    /**
     * 返回传入的字符串是否为有效身份证号
     * @param {String} val 身份证号字符串
     * @return {Boolean}
     */
    isValid: function(val){
        // 18位的号码最后位可能是英文字母，需转换为大写形式
        val = val.toUpperCase();
        var len = val.length;
        // 验证基本格式：15位或18位（最后一位是数字或大写字母）
        if (!this.isValidFormat(val)) {
            return false;
        }
        // 验证号码中的出生日期
        if (!this.isValidBirthday(val)) {
            return false;
        }
        // 18位号的需验证最后一位的有效性（数字或字母）
        if (len == 18) {
            return this.getLastChar(val) == val.substring(17);
        }
        
        return true;
    },
    
    
    
    /**
     * 返回18位的身份证号字符串
     * @param {String} val 身份证号字符串
     * @return {String}
     */
    toLong: function(val){
        val = val.toUpperCase();
        if (val.length == 15) {
            val = val.substr(0, 6) + '19' + val.substring(6);
            val += this.getLastChar(val);
        }
        return val;
    },
    
    /**
     * 获取身份证号最后一位的字符
     * @param {Object} val 身份证号字符串
     * @return {String}
     */
    getLastChar: function(val){
        var numbers = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        var chars = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        var p = 0;
        for (var i = 0; i < 17; i++) {
            p += val.substr(i, 1) * numbers[i];
        }
        return chars[p % 11];
    }
};
