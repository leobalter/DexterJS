/* API Ref: http://api.qunitjs.com */
/* globals QUnit: true, expect: true */

(function() {

	'use strict';

	var Dexter;

	// NPM scope
	if ( !Dexter && typeof module !== 'undefined' && module.exports ) {
		Dexter = require( '../../src/Dexter.js' );
	} else {
		Dexter = window.Dexter;
	}

	QUnit.module( 'Dexter fake', {
		setup: function( assert ) {
			this.foo = {};
			this.foo.bar = function() {
				assert.ok( false, 'fake shoud not call original method' );
			};
			this.fake = Dexter.fake( this.foo, 'bar' );
		},
		teardown: function() {
			Dexter.restore();
		}
	});

	QUnit.test( 'returned object', 2, function( assert ) {
		expect( 2 );

		assert.equal( typeof( this.fake ), 'object', 'Dexter.fake returns and object' );
		assert.ok( this.fake.isActive, 'fake.isActive === true' );
	});

	QUnit.test( 'call count', function( assert ) {
		expect( 11 );

		for ( var i = 0 ; i < 11 ; ++i ) {
			assert.deepEqual( this.fake.called, i, 'fake.called === ' + i );
			this.foo.bar();
		}
	});

	QUnit.test( 'restore()', function( assert ) {
		this.foo.otherBar = function() {
			assert.ok( true, 'fake restore objects' );
		};

		var fake = Dexter.fake( this.foo, 'otherBar' );

		fake.restore();

		this.foo.otherBar();

		assert.deepEqual( fake.called, 0, 'restored fake should not be affected by further calls' );
		assert.deepEqual( fake.isActive, false, 'fake.isActive === false after restoring' );
	});

	QUnit.test( 'callback()', function( assert ) {
		expect( 4 );

		this.fake.callback = function( a, b, c ) {
			assert.ok( true, '.callback is set' );
			assert.deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
		};

		this.foo.bar( 1, 2, 3 );

		this.fake.restore();

		this.fake = Dexter.fake( this.foo, 'bar', function() {
			assert.ok( true, 'callback can be set at fake creation' );
			return 17;
		});

		assert.strictEqual( this.foo.bar(), 17, 'fake returned value set in callback' );
	});

}());
