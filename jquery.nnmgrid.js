/*!
 * jQuery.nnmGrid
 *
 * @version 1.0
 * @author Kazuhiro Shintani
 * @license MIT License (https://github.com/nbnote/jquery-nnmgrid/blob/master/LICENSE)
 * @link https://github.com/nbnote/jquery-nnmgrid
 */

;
(function( $, window, document, undefined ) {

	var plugname = 'nnmGrid';

	var methods = {

		defaults: {
			gap: 5,
			isHover: 'is-hover',
			itemWidth: 150,
			itemHeight: 150,
			itemSelector: '.item',
			onHover: function() {},
			onClick: function() {}
		},

		_init: function( element, option ) {
			this.options = $.extend( {}, this.defaults, option );
			this.$element = element;
			this.$element.data( plugname, this );

			var that = this;
			var opts = this.options;
			var $elem = this.$element;

			this.hovered = -1;
			this.width = 0;
			this.numCols = 0;
			this.numItems = 0;
			this.itemList = [];
			this.childList = [];

			$elem
			.css( {position: 'relative'} )
			.find( opts.itemSelector )
			.each( function( index, element ) {
				that.childList[index] = $( element )
				.children()
				.css( { cursor: 'default' } )
				.on( 'click', $.proxy( that._onClick, that ) );
			} );

			$( document )
			.on( 'mousemove', $.proxy( this._onMouseMove, this ) );

			this._draw();
		},

		update: function() {
			this.width = this.$element.width();
			this._draw();
		},

		_intersect: function( p1, p2, p3, p4 ) {
			var n1 = (p1.x - p2.x) * (p3.y - p1.y) + (p1.y - p2.y) * (p1.x - p3.x);
			var n2 = (p1.x - p2.x) * (p4.y - p1.y) + (p1.y - p2.y) * (p1.x - p4.x);
			return n1 * n2 < 0;
		},

		_include: function( tp1, tp2, tp3, xp ) {
			if ( (tp1.x - tp3.x) * (tp1.y - tp2.y) === (tp1.x - tp2.x) * (tp1.y - tp3.y) ) return false;
			else if ( this._intersect( tp1, tp2, xp, tp3 ) ) return false;
			else if ( this._intersect( tp1, tp3, xp, tp2 ) ) return false;
			else if ( this._intersect( tp2, tp3, xp, tp1 ) ) return false;
			else return true;
		},

		_onMouseMove: function( e ) {
			var opts = this.options;
			var id = this._getIdFromPoint( e.pageX, e.pageY );
			if ( this.hovered !== -1 && this.hovered !== id ) {
				this.itemList[this.hovered]
				.removeClass( opts.isHover )
				.css( { zIndex: 99998 } );
				this.childList[this.hovered]
				.css( { cursor: 'default' } );
				this.hovered = -1;
			}
			if ( id !== -1 && id !== this.hovered ) {
				this.hovered = id;
				this.itemList[this.hovered]
				.addClass( opts.isHover )
				.css( { zIndex: 99999 } );
				this.childList[this.hovered]
				.css( { cursor: 'pointer' } );
				opts.onHover.call( this.itemList[this.hovered][0] );
			}
		},

		_onClick: function( e ) {
			var id = this._getIdFromPoint( e.pageX, e.pageY );
			if ( id !== -1 ) {
				this.options.onClick.call( this.itemList[id][0] );
			} else {
				e.preventDefault();
			}
		},

		_draw: function() {
			var that = this;
			var $elem = this.$element;
			var opts = this.options;

			this.width = $elem.width();
			this.itemList = [];
			$elem
			.find( opts.itemSelector )
			.each( function( index, element ) {
				that.itemList[index] = $( element );
			} );

			this.numItems = this.itemList.length;
			var itemWidth = opts.itemWidth + (opts.gap * 2);
			this.numCols = Math.floor( this.width / itemWidth ) + 1;
			if ( itemWidth * this.numCols - (opts.gap * 2) > this.width ) {
				this.numCols -= 1;
			}
			this.numRows = Math.ceil( this.numItems / this.numCols );

			var i = this.numItems;
			var containerHeight = 0;
			var wh = Math.floor( opts.itemWidth / 2 );
			var hh = Math.floor( opts.itemHeight / 2 );
			var n = this.numCols * 2 - 1;
			for ( ; i--; ) {
				var id = i + Math.floor( i / n );
				var col = id % this.numCols;
				var row = Math.floor( id / this.numCols );
				var indent = row % 2 === 1 ? wh : 0;
				var gap = col * (opts.gap * 2);
				if ( indent !== 0 ) {
					gap += opts.gap;
				}
				var $item = this.itemList[i];
				$item.css( {
					position: 'absolute',
					top: hh * row + (row * opts.gap),
					left: opts.itemWidth * col + indent + gap
				} );
				var h = hh * row + (row * opts.gap) + opts.itemHeight;
				containerHeight = h > containerHeight ? h : containerHeight;
			}
			$elem.height( containerHeight );
		},

		_getIdFromPoint: function( x, y ) {
			var opts = this.options;
			var iw = opts.itemWidth;
			var ih = opts.itemHeight;
			var hw = iw / 2;
			var hh = ih / 2;
			var i = this.itemList.length;
			var xp = { x: x, y: y };
			for ( ; i--; ) {
				var $btn = this.itemList[i];
				var flag = false;
				var offset = $btn.offset();
				var ol = Math.floor( offset.left );
				var ot = Math.floor( offset.top );
				if ( x > ol && x <= ol + iw && y > ot && y <= ot + ih ) {
					var j = 4;
					for ( ; j--; ) {
						var p1 = { x: ol, y: ot + hh };
						var p2 = { x: ol + hw, y: ot + hh };
						var p3 = { x: ol + hw, y: ot };
						switch ( j ) {
							case 1:
								p1.x = ol + iw;
								break;
							case 2:
								p3.y = ot + ih;
								break;
							case 3:
								p1.x = ol + iw;
								p3.y = ot + ih;
								break;
							default:
								break;
						}
						if ( this._include( p1, p2, p3, xp ) ) {
							flag = true;
						}
					}
				}
				if ( flag ) return i;
			}
			return -1;
		}
	};


	$[plugname] = function() {};
	$.extend( $[plugname].prototype, methods );

	$.fn[plugname] = function( method ) {
		if ( methods[method] && method.charAt( 0 ) !== '_' ) {
			var arg = arguments;
			if ( method.substr( 0, 3 ) === 'get' ) {
				return methods[method].apply( $( this ).data( plugname ), Array.prototype.slice.call( arg, 1 ) );
			} else {
				return this.each( function() {
					methods[method].apply( $( this ).data( plugname ), Array.prototype.slice.call( arg, 1 ) );
				} );
			}
		} else if ( typeof method === 'object' || !method ) {
			return this.each( function() {
				new $[plugname]()._init( $( this ), method );
			} );
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.' + plugname );
		}
	};
})( jQuery, window, document );