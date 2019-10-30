/**
 * jquery plugin: slide
 * required: jquery 1.4+
 * author: Nicolas.Z
 * date: July 10, 2012
 */
(function( $ ) {
	
$.fn.slide = function(){
	return this.each(function(){
		var $slide = $(this), $li = $slide.find( '.slide-items li' ), $btn = $slide.find( '.slide-nav li' ),
			len = $li.length;
			
		var	player = {
			_tId: null,
			_delay: 2000,
			_count: 0,
			
			change: function( i, $btn ){
				var $cur = $li.eq(i),
					$img = $( 'img' , $cur ),
					$a = $( 'a' , $cur);
				
				this._count = i;
				$cur.fadeIn().siblings().fadeOut();
				$btn.addClass( 'slide-active' ).siblings().removeClass();
				
				if ( $slide.find( '.slide-title' ).size() ) {
					$slide.find( '.slide-title a' ).text( $img.get(0).alt )
						.attr( 'href', $a.get(0).href );
				}
			},
			
			play: function(){
				var player = this, count = this._count, delay = this._delay;
				
				this._tId = setTimeout(function(){
					count = ( ++count >= len ? 0 : count );
					player.change( count, $btn.eq(count) );
					
					player._tId = setTimeout( arguments.callee, delay );
				}, delay );
			},
			
			stop: function(){
				clearTimeout( this._tId );
			}
		};
		
		player.change( 0, $btn.eq(0) );
		player.play();
		
		$slide.hover( function() {
			player.stop();
		}, function() {
			player.play();
		});
		
		$btn.bind( 'click.slide', function( e ){
			e.preventDefault();
			player.change( $(this).index(), $(this) );
		});
	});
};

})( jQuery );