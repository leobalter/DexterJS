/* API Ref: http://api.qunitjs.com */
/* globals QUnit: true, expect: true */

QUnit.module( 'Dexter AMD ready' );

QUnit.asyncTest( 'Dexter is here as amd!', function( assert ) {
	'use strict';

	expect( 2 );

	require( [ 'dexter' ], function( Dexter ) {
		assert.equal( typeof( Dexter ), 'object', 'Dexter is an object' );
		assert.ok( Dexter, 'Dexter is not falsy' );

		QUnit.start();
	});
});

QUnit.asyncTest( 'Dexter functions as amd', function( assert ) {
	'use strict';

	expect( 2 );

	require( [ 'dexter' ], function( Dexter ) {
		assert.equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
		assert.equal( typeof( Dexter.fake ), 'function', 'Dexter.fake is a function' );

		QUnit.start();
	});
});

QUnit.asyncTest( 'fakeXHR in AMD', function( assert ) {
	'use strict';

	expect( 1 );

	require( [ 'fakeXHR' ], function( fakeXHR ) {
		assert.equal( typeof( fakeXHR.requests ), 'object', 'fakeXHR is also defined by AMD' );

		QUnit.start();
	});
});
