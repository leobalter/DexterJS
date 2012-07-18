/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global foo:true, getXHR:true*/
(function( window ) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  module( 'Dexter Spy', {
    setup : function() {
      foo.bar = function() {
        ok( true, 'spy preserve method calling' );
				return 'foo!';
      };
      this.spy = Dexter.spy( foo, 'bar' );
    }
  });

  test( 'returned object', 5, function() {
    equal( typeof( this.spy ), 'object', 'Dexter.spy returns and object' );
    ok( this.spy.isActive, 'spy.isActive === true' );

    raises( function() {
      Dexter.spy( foo, 'whateverDoesntExist' );
    }, 'raises an error if method doesnt exist' );
    
    raises( function() {
      Dexter.spy();
    }, 'raises an error without arguments' );

    raises( function() {
      Dexter.spy( foo, function() {} );
    }, 'raises an error if method name isn\'t a string' );

  });

  test( 'restore()', 3, function() {
    this.spy.restore();

    // 1 ok
    foo.bar();

    deepEqual( this.spy.called, 0, 'restored spy should not be affected by further calls' );
    deepEqual( this.spy.isActive, false, 'spy.isActive === false after restoring' );
  });

  test( 'call count', 22, function() {
    var i;
    for ( i = 0 ; i < 11 ; ++i ) {
      deepEqual( this.spy.called, i, 'spy.called === ' + i );
      foo.bar();
    }
  });

  test( 'arguments', 1, function() {
    foo.otherBar = function( a, b, c ) {
      deepEqual( [ a, b, c ], [ 'Dexter', 'is', 'here!' ], 'keeping arguments in the spied call' );
    };

    var spy = Dexter.spy( foo, 'otherBar' );

    foo.otherBar( 'Dexter', 'is', 'here!' );
  });

  test( 'callback()', 6, function() {
    this.spy.callback = function( a, b, c ) {
      ok( true, '.callback is set' );
      deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
    };

    foo.bar( 1, 2, 3 );

    this.spy.restore();

    this.spy = Dexter.spy( foo, 'bar', function() {
      ok( true, 'callback can be set at spy creation' );
			return 'bar!';
    });

    strictEqual( foo.bar(), 'foo!', 'spy preserves returned value' );
  });
}( this ) );
