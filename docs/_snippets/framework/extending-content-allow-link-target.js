/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

function AllowLinkTarget( editor ) {
	editor.model.schema.extend( '$text', { allowAttributes: 'linkTarget' } );

	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'linkTarget',
		view: ( attributeValue, writer ) => {
			return writer.createAttributeElement( 'a', { target: attributeValue }, { priority: 5 } );
		},
		converterPriority: 'low'
	} );

	editor.conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			name: 'a',
			key: 'target'
		},
		model: 'linkTarget',
		converterPriority: 'low'
	} );
}

ClassicEditor
	.create( document.querySelector( '#snippet-link-target' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ AllowLinkTarget ],
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );