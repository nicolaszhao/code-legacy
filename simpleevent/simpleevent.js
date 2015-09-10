/**
 * description: simple event binding
 * author: nicolas.z
 * date: Aug 26, 2011
 */
(function(){
    var Event = function(event){
        if (!this.preventDefault) {
            return new Event(event);
        }
        this.originalEvent = event;
        this.type = event.type;
    };
    Event.prototype = {
        preventDefault: function(){
            var e = this.originalEvent;
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },
        stopPropagation: function(){
            var e = this.originalEvent;
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        }
    };
    var _$ = function(el){
        this.element = el;
    };
    _$.prototype = {
        addEvent: function(type, fn){
            var el = this.element, handle = this.handle;
            if (!this.element.events) {
                this.element.events = {};
            }
            var eventHandle = function(){
                return handle.call(el, arguments[0]);
            };
            var handlers = this.element.events[type];
            if (!handlers) {
                handlers = this.element.events[type] = [];
                if (window.addEventListener) {
                    el.addEventListener(type, eventHandle, false);
                } else if (window.attachEvent) {
                    el.attachEvent('on' + type, eventHandle);
                }
            }
            handlers.push(fn);
            return this;
        },
        handle: function(event){
            var e = Event(event || window.event);
            for (var i = 0, events = this.elements.events[e.type], len = events.length; i < len; i++) {
                events[i].call(this, e);
            }
        }
    };
    window.d = function(element){
        return new _$(element);
    };
})();
