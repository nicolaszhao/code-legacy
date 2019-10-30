/**
 * jquery plugin: lazy image
 * requires: jquery 1.4+
 * @author: Nicolas.Z
 * date: 2011-2-25
 */
$.fn.lazyImage = function(options){
    options = $.extend({
        loadingText: "loading"
    }, options);
    
    return this.each(function(){
    
        var images = $(".images", this), 
			controller = $(".controller", this), 
			li = $("li", images);

        showImg(0, controller.find("a:first")[0].href);
        
        controller.bind("mouseover", function(e){
            var target = e.target;
			
            if (target.tagName.toLowerCase() == "a") {
                var index = $(target).parent().index();
                showImg(index, target.href);
            }
        });
		
		function showImg(n, url){
            var a = li.eq(n).find("a");
			
			li.hide().eq(n).show();
            
			if (a.find("img").length == 0) {
                var loadingText = options.loadingText, 
					tId = null, 
					count = 0;
                
                clearTimeout(tId);
                
                var loading = $("<span/>", { "text": loadingText, "class": "loading" }).appendTo(a);
                
                tId = setTimeout(function(){
					var text = loading.text();
                    loading.text(text + ".");
                    if (++count > 3) {
                        loading.text(loadingText);
						count = 0;
                    }
                    tid = setTimeout(arguments.callee, 400);
                }, 400);
                
                var img = $("<img/>").appendTo(a);
                img.load(function(){
                    clearTimeout(tId);
                    loading.remove();
                });
                img.attr("src", url);
            }
        }
        
    });
};
