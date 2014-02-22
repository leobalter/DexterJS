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

	QUnit.module( 'Dexter Spy', {
		setup: function( assert ) {
			this.foo = {};
			this.foo.bar = function() {
				assert.ok( true, 'spy preserve method calling' );
				return 'foo!';
			};
			this.spy = Dexter.spy( this.foo, 'bar' );
		},
		teardown: function() {
			Dexter.restore();
		}
	});

	QUnit.test( 'returned object', function( assert ) {
		expect( 5 );

		assert.equal( typeof( this.spy ), 'object', 'Dexter.spy returns and object' );
		assert.ok( this.spy.isActive, 'spy.isActive === true' );

		assert.throws(function() {
			Dexter.spy( this.foo, 'whateverDoesntExist' );
		}, 'raises an error if method doesnt exist' );

		assert.throws(function() {
			Dexter.spy();
		}, 'raises an error without arguments' );

		assert.throws(function() {
			Dexter.spy( this.foo, function() {} );
		}, 'raises an error if method name isn\'t a string' );

	});

	QUnit.test( 'restore()', function( assert ) {
		expect( 3 );

		this.spy.restore();

		this.foo.bar();

		assert.deepEqual( this.spy.called, 0, 'restored spy should not be affected by further calls' );
		assert.deepEqual( this.spy.isActive, false, 'spy.isActive === false after restoring' );
	});

	QUnit.test( 'call count', function( assert ) {
		expect( 22 );

		for ( var i = 0 ; i < 11 ; ++i ) {
			assert.deepEqual( this.spy.called, i, 'spy.called === ' + i );
			this.foo.bar();
		}
	});

	QUnit.test( 'arguments', function( assert ) {
		expect( 1 );

		this.foo.otherBar = function( a, b, c ) {
			assert.deepEqual( [ a, b, c ], [ 'Dexter', 'is', 'here!' ], 'keeping arguments in the spied call' );
		};

		var spy = Dexter.spy( this.foo, 'otherBar' );

		this.foo.otherBar( 'Dexter', 'is', 'here!' );

		spy.restore();
	});

	QUnit.test( 'callback()', function( assert ) {
		expect( 6 );

		this.spy.callback = function( a, b, c ) {
			assert.ok( true, '.callback is set' );
			assert.deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
		};

		this.foo.bar( 1, 2, 3 );

		this.spy.restore();

		this.spy = Dexter.spy( this.foo, 'bar', function() {
			assert.ok( true, 'callback can be set at spy creation' );
			return 'bar!';
		});

		assert.strictEqual( this.foo.bar(), 'foo!', 'spy preserves returned value' );
	});

	QUnit.test( 'callback() order', function( assert ) {
		expect( 1 );

		var foo = '';

		Dexter.__bar__ = function() {
			foo = 'a';
		};

		Dexter.spy( Dexter, '__bar__', function() {
			foo += 'b';
		});

		Dexter.__bar__();

		assert.strictEqual( foo, 'ab', 'callback called after spied function' );
	});

}());
