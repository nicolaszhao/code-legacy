var Callbacks = function() {
    var list = [],
        callbacks = {
            done: function(callback) {
                list.push(callback);
                return this;
            },
           
            resolve: function(value) {
                var len = list.length;
                while(len--) {
                    list.shift()(value);
                }
            },
           
            promise: function() {
                return callbacks;
            }
        };
   
    return callbacks;
};

// 调用示例：
var fn = function() {
	var cb = Callbacks();
	
	$.ajax('api.php', {
		success: function(res) {
			cb.resolve(res);
		}
	});
	
	return cb.promise();
};

fn().done(function(data) {
	console.log(JSON.stringify(data));
});
