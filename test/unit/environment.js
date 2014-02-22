/* API Ref: http://api.qunitjs.com */
/* globals QUnit: true */

(function() {

	'use strict';

	var Dexter;

	// Node scope
	if ( !Dexter && typeof module !== 'undefined' && module.exports ) {
		Dexter = require( '../../src/Dexter.js' );
	} else {
		Dexter = window.Dexter;
	}

	QUnit.module( 'Environment' );

	QUnit.test( 'Dexter is here!', function( assert ) {
		assert.equal( typeof( Dexter ), 'object', 'Dexter is an object' );
		assert.ok( Dexter, 'Dexter is not falsy' );
	});

	QUnit.test( 'Dexter functions', function( assert ) {
		assert.equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
		assert.equal( typeof( Dexter.fake ), 'function', 'Dexter.fake is a function' );
		assert.equal( typeof( Dexter.timer ), 'function', 'Dexter.Timer is a function' );
	});

}());
