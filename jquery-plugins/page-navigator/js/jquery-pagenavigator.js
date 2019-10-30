/**
 * description: page navigator
 * author: Nicolas.Z
 * date: June 12, 2012
 * requires: jQuery v1.4+
 */
(function( $ ) {

var PageNavigator = function( items, pageItemsCount ) {
	this.$items = items;
    this.itemsCount = items.length;
    this.pageItemsCount = pageItemsCount;
    this.pageCount = Math.ceil( items.length / pageItemsCount );
    this.pageIndex = 0;
    this.counter = [ 0, pageItemsCount ];
    
	this._init();
};

PageNavigator.prototype = {
    constructor: PageNavigator,
    _init: function() {
		this.showItems( 0, this.pageItemsCount );
	},
    showItems: function( start, end ) {
        this.$items.hide().slice( start, end ).show();
    },
	previous: function() {
		var pageItemsCount = this.pageItemsCount;
		
		if ( this.pageIndex > 0 ) {
			this.showItems( this.counter[0] -= pageItemsCount, this.counter[1] -= pageItemsCount );
			this.pageIndex--;
		}
	},
	next: function() {
		var pageItemsCount = this.pageItemsCount;
		
		if ( this.pageIndex < this.pageCount - 1 ) {	
			this.showItems( this.counter[0] += pageItemsCount, this.counter[1] += pageItemsCount );
			this.pageIndex++;
		}
	}
};

$.fn.pagenavigator = function( options ){
    var settings = $.extend({
		items: null,
        pageItemsCount: 6,
        prevClass: 'prev',
        nextClass: 'next',
        disabledClass: 'disabled'
    }, options );
	
	return this.each(function() {
		var $navigator = $( this ), 
			$prev = $navigator.find( '.' + settings.prevClass ),
			$next = $navigator.find( '.' + settings.nextClass ),
			
			items = $( settings.items ),
			pageItemsCount = settings.pageItemsCount,
			pageNavigator = new PageNavigator( items, pageItemsCount );
		
		$prev.addClass( settings.disabledClass );
		
		if ( pageNavigator.pageCount == 1 ) {
			$next.addClass( settings.disabledClass );
		}
		
		$navigator.bind( 'click.pagenavigator', function( e ) {
           	var $button = $( e.target );
           	
            e.preventDefault();
            
            if ( $button.hasClass( settings.prevClass ) ) {
                pageNavigator.previous();
            }
            if ( $button.hasClass( settings.nextClass ) ) {
                pageNavigator.next();
            }
            
            if ( pageNavigator.pageIndex == 0 ) {
            	$prev.addClass( settings.disabledClass );
            } else if ( pageNavigator.pageIndex == pageNavigator.pageCount - 1 ) {
            	$next.addClass( settings.disabledClass );
            } else {
            	$prev.add( $next ).removeClass( settings.disabledClass );
            }
        });
	});
};

})( jQuery );