/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document */

import Document from '/ckeditor5/engine/view/document.js';
import { setData } from '/ckeditor5/engine/dev-utils/view.js';

const viewDocument = new Document();
viewDocument.createRoot( document.getElementById( 'editor' ) );

viewDocument.isFocused = true;

setData( viewDocument,
	'<container:p>fo{}o</container:p>' +
	'<container:p></container:p>' +
	'<container:p><attribute:strong></attribute:strong></container:p>' +
	'<container:p>bar</container:p>' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	const node = data.newSelection.getFirstPosition().parent;
	console.log( node.name ? node.name : node._data );
	viewDocument.selection.setTo( data.newSelection );
} );

viewDocument.render();
