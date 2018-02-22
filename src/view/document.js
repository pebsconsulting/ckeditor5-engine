/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/document
 */

import Selection from './selection';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

/**
 * Document class creates an abstract layer over the content editable area, contains a tree of view elements and
 * {@link module:engine/view/selection~Selection view selection} associated with this document.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Document {
	/**
	 * Creates a Document instance.
	 */
	constructor() {
		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @member {module:engine/view/selection~Selection} module:engine/view/document~Document#selection
		 */
		this.selection = new Selection();

		/**
		 * Roots of the view tree. Collection of the {module:engine/view/element~Element view elements}.
		 *
		 * View roots are created as a result of binding between {@link module:engine/view/document~Document#roots} and
		 * {@link module:engine/model/document~Document#roots} and this is handled by
		 * {@link module:engine/controller/editingcontroller~EditingController}, so to create view root we need to create
		 * model root using {@link module:engine/model/document~Document#createRoot}.
		 *
		 * @readonly
		 * @member {Collection} module:engine/view/document~Document#roots
		 */
		this.roots = new Collection( { idProperty: 'rootName' } );

		/**
		 * Defines whether document is in read-only mode.
		 *
		 * When document is read-ony then all roots are read-only as well and caret placed inside this root is hidden.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * True if document is focused.
		 *
		 * This property is updated by the {@link module:engine/view/observer/focusobserver~FocusObserver}.
		 * If the {@link module:engine/view/observer/focusobserver~FocusObserver} is disabled this property will not change.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/document~Document#isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * Post-fixer callbacks registered to the model document.
		 *
		 * @private
		 * @member {Set}
		 */
		this._postFixers = new Set();
	}

	/**
	 * Gets a {@link module:engine/view/document~Document#roots view root element} with the specified name. If the name is not
	 * specific "main" root is returned.
	 *
	 * @param {String} [name='main'] Name of the root.
	 * @returns {module:engine/view/rooteditableelement~RootEditableElement|null} The view root element with the specified name
	 * or null when there is no root of given name.
	 */
	getRoot( name = 'main' ) {
		return this.roots.get( name );
	}

	/**
	 * TODO: update docs
	 * Used to register a post-fixer callback. A post-fixer mechanism guarantees that the features that listen to
	 * the {@link module:engine/model/model~Model#event:_change model's change event} will operate on a correct model state.
	 *
	 * An execution of a feature may lead to an incorrect document tree state. The callbacks are used to fix the document tree after
	 * it has changed. Post-fixers are fired just after all changes from the outermost change block were applied but
	 * before the {@link module:engine/model/document~Document#event:change change event} is fired. If a post-fixer callback made
	 * a change, it should return `true`. When this happens, all post-fixers are fired again to check if something else should
	 * not be fixed in the new document tree state.
	 *
	 * As a parameter, a post-fixer callback receives a {@link module:engine/model/writer~Writer writer} instance connected with the
	 * executed changes block. Thanks to that, all changes done by the callback will be added to the same
	 * {@link module:engine/model/batch~Batch batch} (and undo step) as the original changes. This makes post-fixer changes transparent
	 * for the user.
	 *
	 * An example of a post-fixer is a callback that checks if all the data were removed from the editor. If so, the
	 * callback should add an empty paragraph so that the editor is never empty:
	 *
	 *		document.registerPostFixer( writer => {
	 *			const changes = document.differ.getChanges();
	 *
	 *			// Check if the changes lead to an empty root in the editor.
	 *			for ( const entry of changes ) {
	 *				if ( entry.type == 'remove' && entry.position.root.isEmpty ) {
	 *					writer.insertElement( 'paragraph', entry.position.root, 0 );
	 *
	 *					// It is fine to return early, even if multiple roots would need to be fixed.
	 *					// All post-fixers will be fired again, so if there are more empty roots, those will be fixed, too.
	 *					return true;
	 *				}
	 *			}
	 *		} );
	 *
	 * @param {Function} postFixer
	 */
	registerPostFixer( postFixer ) {
		this._postFixers.add( postFixer );
	}

	/**
	 * Performs post-fixer loops. Executes post-fixer callbacks as long as none of them has done any changes to the model.
	 *
	 * @protected
	 */
	_callPostFixers( writer ) {
		let wasFixed = false;

		do {
			for ( const callback of this._postFixers ) {
				wasFixed = callback( writer );

				if ( wasFixed ) {
					break;
				}
			}
		} while ( wasFixed );
	}
}

mix( Document, ObservableMixin );

/**
 * Enum representing type of the change.
 *
 * Possible values:
 *
 * * `children` - for child list changes,
 * * `attributes` - for element attributes changes,
 * * `text` - for text nodes changes.
 *
 * @typedef {String} module:engine/view/document~ChangeType
 */
