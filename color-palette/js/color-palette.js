var colorPalette = {
	getHSBFromRGB: function( rgb ) {
		var r = rgb.r, g = rgb.g, b = rgb.b,
			min = Math.min( r, g, b ), max = Math.max( r, g, b ),
			h, s;
		
		if ( min == max ) {
			h = 0;
		} else if ( max == r && g >= b ) {
			h = 60 * ( (g - b) / (max - min) );
		} else if ( max == r && g < b ) {
			h = 60 * ( (g - b) / (max - min) ) + 360;
		} else if ( max == g ) {
			h = 60 * ( (b - r) / (max - min) ) + 120;
		} else if ( max == b ) {
			h = 60 * ( (r - g) / (max - min) ) + 240;
		}
		
		if ( max == 0 ) {
			s = 0;
		} else {
			s = 1 - ( min / max );
		}
		
		return {
			h: ( h >= 360 ) ? 0 : h,
			s: Math.round( s * 100 ),
			b: Math.round( max / 255 * 100 )
		};
	},
	
	getHSBFromHex: function( hex ) {
		return this.getHSBFromRGB( this.getRGBFromHex(hex) );
	},
	
	getRGBFromHSB: function( hsb ) {
		var h = hsb.h, s = hsb.s, b = hsb.b,
			f, p, q, t, i,
			rgbR, rgbG, rgbB;

		// Make sure our arguments stay in-range
		h = Math.max( 0, Math.min(360, h) );
		s = Math.max( 0, Math.min(100, s) );
		b = Math.max( 0, Math.min(100, b) );

		// We accept saturation and value arguments from 0 to 100 because that's
		// how Photoshop represents those values. Internally, however, the
		// saturation and value are calculated from a range of 0 to 1. We make
		// That conversion here.
		s /= 100;
		b /= 100;

		if ( s == 0 ) {
			
			// Achromatic (grey)
			rgbR = rgbG = rgbB = b;
			
		} else {
			h /= 60;
			
			// sector 0 to 5
			i = Math.floor( h );
			f = h - i;
			
			// factorial part of h
			p = b * ( 1 - s );
			q = b * ( 1 - s * f );
			t = b * ( 1 - s * (1 - f) );
	
			switch( i ) {
				case 0:
					rgbR = b;
					rgbG = t;
					rgbB = p;
					break;
				case 1:
					rgbR = q;
					rgbG = b;
					rgbB = p;
					break;
				case 2:
					rgbR = p;
					rgbG = b;
					rgbB = t;
					break;
				case 3:
					rgbR = p;
					rgbG = q;
					rgbB = b;
					break;
				case 4:
					rgbR = t;
					rgbG = p;
					rgbB = b;
					break;
				default:
					rgbR = b;
					rgbG = p;
					rgbB = q;
			}
		}

		return {
			r: Math.round( rgbR * 255 ),
			g: Math.round( rgbG * 255 ),
			b: Math.round( rgbB * 255 )
		};
	},
	
	getRGBFromHex: function( hex ) {
		var hex = hex.charAt(0) == '#' ? hex.substring( 1 ) : hex,
			len = hex.length, rgb = [];
			
		if ( len == 3 ) {
			for ( var i = 0; i < len; i++ ) {
				rgb[i] = hex.charAt(i) + hex.charAt(i);
			}
		} else if ( len == 6 ) {
			rgb = hex.split(/(?=(?:..)*$)/);
		}
	
		for ( var i = 0; i < rgb.length; i++ ) {
			rgb[i] = parseInt( rgb[i], 16 );
		}
		
		return {
			r: rgb[0] || 0,
			g: rgb[1] || 0,
			b: rgb[2] || 0
		};
	},
	
	getHexFromRGB: function( rgb ) {
		var hex = [ rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16) ];
		
		for ( var i = 0, len = hex.length; i < len; i++ ) {
			if ( hex[i].length == 1 ) {
				hex[i] = '0' + hex[i];
			}
		}
		
		return hex.join('').toUpperCase();
	},
	
	getHexFromHSB: function( hsb ) {
		return this.getHexFromRGB( this.getRGBFromHSB(hsb) );
	},
	
	getDarkerColor: function( hex ) {
		var hsb = this.getHSBFromHex( hex ), val = 10;
			
		hsb.b = hsb.b > 0 ? hsb.b - val : 0;
		if ( hsb.b < 0 ) {
			hsb.b = 0;
		}
		
		return this.getHexFromHSB( hsb );
	},
	
	getLighterColor: function( hex ) {
		var hsb = this.getHSBFromHex( hex ), val = 10;
			
		if ( hsb.b == 100 ) {
			hsb.s -= val;
			if ( hsb.s < 0 ) {
				hsb.s = 0;	
			}
		} else {
			hsb.b += val;
			if ( hsb.b > 100 ) {
				hsb.b = 100;
			}
		}
		
		return this.getHexFromHSB( hsb );
	}
};