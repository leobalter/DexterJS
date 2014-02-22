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

QUnit.module( 'Timer', {
	setup: function() {
		this.timer = Dexter.timer();
	},
	teardown: function() {
		this.timer.restore();
	}
});

QUnit.test( 'defined function', function( assert ) {
	assert.equal( typeof this.timer.tick, 'function' );
});

QUnit.test( 'resetTimers', function( assert ) {
	expect( 1 );

	var timer = this.timer,
		ticked = 0;

	setTimeout(function() {
		ticked++;
	}, 2000 );

	setTimeout(function() {
		ticked++;
	}, 3000 );

	setTimeout(function() {
		ticked++;
	}, 4000 );

	timer.resetTimers();
	timer.tick( 4000 );

	assert.strictEqual( ticked, 0 );
});

QUnit.test( 'setTimeout function callback', function( assert ) {
	expect( 1 );

	var timer = this.timer,
		ticked = false;

	setTimeout(function() {
		ticked = true;
	}, 2000 );

	timer.tick( 2000 );

	assert.ok( ticked );
});

QUnit.test( 'multiple setTimeout function callback', function( assert ) {
	expect( 2 );

	var timer = this.timer,
		ticked = 0;

	setTimeout(function() {
		ticked++;
	}, 2000 );

	setTimeout(function() {
		ticked++;
	}, 3000 );

	timer.tick( 2000 );

	assert.strictEqual( ticked, 1 );

	timer.tick( 1000 );

	assert.strictEqual( ticked, 2 );
});

QUnit.test( 'setTimeout string callback', function( assert ) {
	expect( 1 );

	var timer = this.timer;

	// We use Dexter's namespace to get a global reference
	// for browsers and node envs.
	Dexter.ticked = false;

	/* jshint evil:true */
	setTimeout( 'Dexter.ticked = true', 2000 );

	timer.tick( 2000 );

	assert.strictEqual( Dexter.ticked, true );
});

QUnit.test( 'setInterval function callback', function( assert ) {
	expect( 1 );

	var timer = this.timer,
		ticked = 0;

	setInterval(function() {
		ticked++;
	}, 2000 );

	timer.tick( 2000 );

	assert.strictEqual( ticked, 1 );
});

QUnit.test( 'setInterval function callback more then 1 time', function( assert ) {
	expect( 1 );

	var timer = this.timer,
		ticked = 0;

	setInterval(function() {
		ticked++;
	}, 2000 );

	timer.tick( 6000 );

	assert.strictEqual( ticked, 3 );
});

QUnit.test( 'setInterval string callback', function( assert ) {
	expect( 1 );

	var timer = this.timer;

	// We use Dexter's namespace to get a global reference
	// for browsers and node envs.
	Dexter.ticked = false;

	/* jshint evil:true */
	setInterval( 'Dexter.ticked++', 2000 );

	timer.tick( 2000 );

	assert.strictEqual( Dexter.ticked, 1 );
});

QUnit.test( 'Restore setTimeOut', function( assert ) {
	expect( 1 );

	var timer = this.timer;

	timer.restore();

	setTimeout(function() {
		assert.ok( true );
		QUnit.start();
	}, 13 );

	QUnit.stop();
});

QUnit.test( 'Restore setTimeOut after using it', function( assert ) {
	expect( 2 );

	var timer = this.timer,
		ticked = 0;

	setTimeout(function() {
		ticked++;
	}, 10000 );

	timer.tick( 10000 );

	assert.strictEqual( ticked, 1 );

	timer.restore();

	setTimeout(function() {
		assert.ok( true );
		QUnit.start();
	}, 13 );

	QUnit.stop();
});

QUnit.test( 'Restore setInterval and clearInterval', function( assert ) {
	expect( 1 );

	var timer = this.timer,
		myInterval;

	timer.restore();

	myInterval = setInterval(function() {
		assert.ok( true );
		clearInterval( myInterval );
		QUnit.start();
	}, 3 );

	QUnit.stop();
});

QUnit.test( 'Restore setInterval and clearInterval after using it', function( assert ) {
	expect( 2 );

	var timer = this.timer,
		ticked = 0,
		myInterval;

	setInterval(function() {
		ticked++;
	}, 10000 );

	timer.tick( 10000 );

	assert.strictEqual( ticked, 1 );

	timer.restore();

	myInterval = setInterval(function() {
		assert.ok( true );
		clearInterval( myInterval );
		QUnit.start();
	}, 13 );

	QUnit.stop();
});

QUnit.test( 'clearTimeout', function( assert ) {
	expect( 1 );

	var timer = this.timer,
		ticked = 0,
		myTimeout;

	myTimeout = setTimeout(function() {
		ticked++;
	}, 1000 );

	clearTimeout( myTimeout );

	timer.tick( 1000 );

	assert.strictEqual( ticked, 0 );
});

QUnit.test( 'clearInverval', function( assert ) {
	expect( 2 );

	var timer = this.timer,
		ticked = 0,
		myInterval;

	myInterval = setInterval(function() {
		ticked++;
	}, 1000 );

	timer.tick( 2000 );

	assert.strictEqual( ticked, 2 );

	clearInterval( myInterval );

	timer.tick( 2000 );

	assert.strictEqual( ticked, 2 );
});

})();
