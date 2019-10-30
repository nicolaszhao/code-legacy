/**
 * description: position a image to center of container
 * author: Nicolas.Z
 * date: April 24, 2012
 * requires: jQuery v1.4+
 */
(function( $ ) {
	
var diminish = function( $target, maxWidth, maxHeight ) {
	var width = $target.outerWidth(),
		height = $target.outerHeight(),
		verticalPadding = width - $target.width(), 
		horizontalPadding = height - $target.height();
		
	if ( width > maxWidth ) {
		height = height * ( maxWidth / width );
		width = maxWidth;
	}
	
	if ( height > maxHeight ) {
		width = width * ( maxHeight / height );
		height = maxHeight;
	}
	
	$target.css({
		width: width - verticalPadding,
		height: height - horizontalPadding
	});
	
	return {
		width: width,
		height: height
	};
};

$.fn.center = function( options ) {
	var settings = $.extend({
		src: '',
		maxWidth: 0,
		maxHeight: 0
	}, options );
	
	return this.each(function() {
		var $self = $( this ), 
			$container = $self.parent(),
			containerWidth = $container.innerWidth(),
			containerHeight = $container.innerHeight(),
			rect, src;
		
		var center  = function() {
			rect = diminish( $self, settings.maxWidth || containerWidth, settings.maxHeight || containerHeight );
			$container.css( 'position', 'relative' );
			$self.css({
				'position': 'absolute',
				'top': ( containerHeight - rect.height ) / 2,
				'left': ( containerWidth - rect.width ) / 2
			});
		};
		
		if ( $self.is( 'img' ) ) {
			$container.css( 'overflow', 'hidden' );
			$self.bind( 'load', function() {
				// for IE
				$self.unbind( 'load' );
				
				center();
				$container.css( 'overflow', 'visible' );
			});
			
			// for IE
			if ( this.src ) {
				src = this.src;
			}
			if ( settings.src && typeof settings.src === 'string' ) {
				src = settings.src;
			}
			this.src = src;
			
		} else {
			center();
		}
	});
};

})( jQuery );