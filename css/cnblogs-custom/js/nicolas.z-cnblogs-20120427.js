/**
 * blog: NICOLAS.Z
 * url: http://nicolaszhao.cnblogs.com/
 * author Nicolas.Z
 * date: April 26, 2012
 * requires: jQuery v1.4+
 */
$(function(){
	
	// footer
	$( '.ad_commentbox_up, #site_nav_under' ).each(function(){
		$( this ).find( 'a' )
			.wrapAll( '<ul/>' ).wrap( '<li/>' )
			.parents( 'ul' ).prependTo( '#footer' );
	});
	$( '#footer' ).find( 'ul' ).wrapAll( '<div class="site-map"></div>' );
	
	// comments title
	if ( $( '.feedback_area_title' ).size() ) {
		$( '#commentform_title' ).hide();
	}
		
	// 文章右下角的推荐
	$( '.diggit' ).append('<div class="diggit-text">推荐一下</div>');
});

// override common.js
var OnDelComment = function( res ) {
	if ( res ) {
		$( currentDelElement )
			.closest( '.feedbackItem' ).fadeOut(function(){
				$( this ).remove();
			});
	} else {
		alert( '删除失败！' );
	}
};

$( window ).bind( 'load', function() {
	
	// IT News list
	$( '.itnews' ).each(function(){
		var $h3 = $( this ).find( 'b:first' ).replaceWith(function() {
				return '<h3>' + $( this ).text() + '</h3>';
			})
			.end().find( 'h3' ),
			
			$ul = $( this ).find( 'a' )
				.first().wrapInner( '<strong/>' )
				.end().wrapAll( '<ul/>' ).wrap( '<li/>' )
				.end().find( 'ul' );
		
		$( this ).empty().append( $h3, $ul );
	});
	
	// comments operate
	$( '.sendMsg2This' ).text( '发送站内短信' );
	
	// right column: Top News
	$( '.news_ul li' )
		.filter( ':odd' ).addClass( 'odd' )
		.end().find( 'a' ).textEllipsis();
});
