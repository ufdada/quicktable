CKEDITOR.plugins.add( 'quicktable', {
	requires: 'table,panelbutton,floatpanel',
	lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
	afterInit: function( editor ) {
		var quickRows = editor.config.quickTableRows || 8,
			quickColumns = editor.config.quickTableColumns || 10,
			quickBorder = editor.config.quickTableBorder || '1',
			quickStyle = editor.config.quickTableStyle || null,
			quickWidth = editor.config.quickTableWidth || '100%';
			
		function makeElement( name ) {
			return new CKEDITOR.dom.element( name, editor.document );
		}

		function insertTable( rowCount, columnCount ) {
			var table = makeElement( 'table' );
			var tbody = table.append( makeElement( 'tbody' ) );

			for ( var i = 0; i < rowCount; i++ ) {
				var row = tbody.append( makeElement( 'tr' ) );
				for ( var j = 0; j < columnCount; j++ ) {
					var cell = row.append( makeElement( 'td' ) );
					cell.appendBogus();
				}
			}

			table.setAttribute( 'border', quickBorder );
			quickStyle && table.setAttribute( 'style', quickStyle );
			table.setStyle( 'width', quickWidth );
			editor.insertElement( table );
		}

		function renderQuickTable(panel) {
			var output = [];

			var clickFn = CKEDITOR.tools.addFunction( function( i, j ) {
				insertTable( parseInt( i, 10 ) + 1, parseInt( j, 10 ) + 1 );
				panel.hide();
			} );

			output.push( '<a style="display:block" _cke_focus=1 hidefocus=true href="javascript:void(1)">' +
				'<table role="presentation" cellspacing=0 cellpadding=0 style="width: 154px; margin: 0 auto 3px;table-layout:fixed;border-collapse:collapse;border: 1px solid #aaa">' );

			for ( var i = 0; i < quickRows; i++ ) {
				output.push( '<tr>' );
				for ( var j = 0; j < quickColumns; j++ ) {
					output.push( '<td style="border: 1px solid #aaa;width:14px;height:14px;" data-i="' + i + '" data-j="' + j + '"' +
						' onclick="CKEDITOR.tools.callFunction(', clickFn, ',\'', i, '\',\'', j, '\'); return false;"' +
					'></td>' );
				}
				output.push('</tr>');
			}

			output.push( '</table></a>' );

			return output.join( '' );
		}

		var selection = {row: -1, column: -1};
		function select( label, table, rowCount, columnCount ) {
			var rows = table.$.tBodies[0].rows;
			for ( var i = 0; i < rows.length; i++ ) {
				var cells = rows[i].cells;
				for ( var j = 0; j < cells.length; j++ ) {
					var cell = cells[j];
					if ( i < rowCount && j < columnCount ) {
						cell.style.background = '#E5E5E5';
					} else {
						cell.style.background = '';
					}
				}
			}
			selection.row = rowCount - 1;
			selection.column = columnCount - 1;
			label.setText( rowCount + ' × ' + columnCount + ' ' + editor.lang.table.toolbar );
		}
		
		editor.ui.add( 'Table', CKEDITOR.UI_PANELBUTTON, {
			label: editor.lang.table.toolbar,
			command: 'table',
			modes: { wysiwyg: 1 },
			editorFocus: 0,
			toolbar: 'insert,30',

			caption: null,
			table: null,

			panel: {
				css: CKEDITOR.skin.getPath( 'editor' ),
				attributes: { role: 'listbox', 'aria-label': editor.lang.table.toolbar }
			},

			onBlock: function( panel, block ) {
				block.autoSize = true;
				block.element.addClass( 'cke_colorblock' );

				var caption = new CKEDITOR.dom.element( 'div' );
				caption.setStyles( { 'text-align': 'center', 'margin': '3px 0' } );
				block.element.append( caption );
				this.caption = caption;

				var tableWrapper = CKEDITOR.dom.element.createFromHtml( renderQuickTable(panel) );
				var table = tableWrapper.getFirst();
				table.on( 'mouseleave', function( evt ) {
					select( caption, table, 1, 1 );
				} );
				table.on( 'mousemove', function( evt ) {
					var target = evt.data.getTarget();
					if ( target.getName() == 'td' ) {
						var i = parseInt( target.getAttribute( 'data-i' ), 10 );
						var j = parseInt( target.getAttribute( 'data-j' ), 10 );
						select( caption, table, i + 1, j + 1 );
					}
				} );
				tableWrapper.on( 'keydown', keyNavigation );
				block.element.append( tableWrapper );
				this.table = table;

				var moreButton = new CKEDITOR.dom.element( 'a' );
				moreButton.setAttributes( {
					_cke_focus: 1,
					hidefocus: true,
					title: editor.lang.quicktable.more,
					href: 'javascript:void("' + editor.lang.quicktable.more + '")',
					role: 'option'
				} );
				moreButton.addClass( 'cke_colormore' );
				moreButton.setText( editor.lang.quicktable.more );
				moreButton.setStyle( 'text-align', 'center' );
				moreButton.on( 'click', function( evt ) {
					editor.execCommand( 'table' );
					evt.data.preventDefault();
				} );
				block.element.append( moreButton );

				CKEDITOR.ui.fire( 'ready', this );

				var keys = block.keys;
				var rtl = editor.lang.dir == 'rtl';
				keys[ rtl ? 37 : 39 ] = 'next'; // ARROW-RIGHT
				keys[ 40 ] = 'next'; // ARROW-DOWN
				keys[ 9 ] = 'next'; // TAB
				keys[ rtl ? 39 : 37 ] = 'prev'; // ARROW-LEFT
				keys[ 38 ] = 'prev'; // ARROW-UP
				keys[ CKEDITOR.SHIFT + 9 ] = 'prev'; // SHIFT + TAB
				keys[ 32 ] = 'click'; // SPACE

				function keyNavigation( evt ) {
					var keystroke = evt.data.getKeystroke(),
						row = selection.row,
						column = selection.column;

					switch ( keystroke ) {
						case 37: // ARROW-LEFT
							column--;
							break;
						case 39: // ARROW-RIGHT
							column++;
							break;
						case 40: // ARROW-DOWN
							row++;
							break;
						case 38: // ARROW-UP
							row--;
							break;
						case 13: // ENTER
						case 32: // SPACE
							insertTable( row + 1, column + 1 );
							return;
						default:
							return;
					}

					if ( row < 0 || column < 0 ) {
						panel.hide();
						return;
					}

					if ( row > quickRows - 1 || column > quickColumns - 1 ) {
						editor.execCommand( 'table' );
					}

					select( caption, table, row + 1, column + 1 );
					evt.data.preventDefault();
					evt.data.stopPropagation();
				}
			},

			onOpen: function() {
				select( this.caption, this.table, 1, 1 );
			}
		} );
	}
});