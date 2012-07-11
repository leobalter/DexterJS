/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function(window) {

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

  module( 'Environment' );

  test( 'Dexter is here!', function() {
    equal( typeof( Dexter ), 'object', 'Dexter is an object' );
    ok( Dexter, 'Dexter is not falsy' );
  });

  test( 'Dexter functions', function() {
    equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
    equal( typeof( Dexter.stub ), 'function', 'Dexter.stub is a function' );
  });

  module( 'Dexter Spy', {
    setup : function() {
      window.$$$ = function() {
        ok( true, 'spy preserve method calling' );
      };
      this.spy = Dexter.spy( window, '$$$' );
    }
  });

  test( 'returned object', 5, function() {
    equal( typeof( this.spy ), 'object', 'Dexter.spy returns and object' );
    ok( this.spy.isActive, 'spy.isActive === true' );

    raises( function() {
      Dexter.spy( window, 'whateverDoesntExist' );
    }, 'raises an error if method doesnt exist' );
    
    raises( function() {
      Dexter.spy();
    }, 'raises an error without arguments' );

    raises( function() {
      Dexter.spy( window, function() {} );
    }, 'raises an error if method name isn\'t a string' );

  });

  test( 'restore()', 3, function() {
    this.spy.restore();

    // 1 ok
    window.$$$();

    deepEqual( this.spy.called, 0, 'restored spy should not be affected by further calls' );
    deepEqual( this.spy.isActive, false, 'spy.isActive === false after restoring' );
  });

  test( 'call count', 22, function() {
    var i;
    for ( i = 0 ; i < 11 ; ++i ) {
      deepEqual( this.spy.called, i, 'spy.called === ' + i );
      window.$$$();
    }
  });

  test( 'arguments', 1, function() {
    window.$$$$ = function( a, b, c ) {
      deepEqual( [ a, b, c ], [ 'Dexter', 'is', 'here!' ], 'keeping arguments in the spied call' );
    };

    var spy = Dexter.spy( window, '$$$$' );

    window.$$$$( 'Dexter', 'is', 'here!' );
  });

  module( 'Dexter Stub', {
    setup : function() {
      window.$$$ = function() {
        ok( false, 'stub shoud not call original stubbed method' );
      };
      this.stub = Dexter.stub( window, '$$$' );
    }
  });

  test( 'returned object', 2, function() {
    equal( typeof( this.stub ), 'object', 'Dexter.stub returns and object' );
    ok( this.stub.isActive, 'stub.isActive === true' );
  });

  test( 'call count', 11, function() {
    var i;
    for ( i = 0 ; i < 11 ; ++i ) {
      deepEqual( this.stub.called, i, 'stub.called === ' + i );
      window.$$$();
    }
  });

  test( 'restore()', function() {
    window.$$$$ = function() {
      ok( true, 'stub restore objects' );
    };

    var stub = Dexter.stub( window, '$$$$' );

    stub.restore();

    window.$$$$();

    deepEqual( stub.called, 0, 'restored stub should not be affected by further calls' );
    deepEqual( stub.isActive, false, 'stub.isActive === false after restoring' );
  });

  test( 'callback()', 3, function() {
    this.stub.callback = function( a, b, c ) {
      ok( true, '.callback is set' );
      deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
    };

    window.$$$( 1, 2, 3 );

    this.stub.restore();

    this.stub = Dexter.stub( window, '$$$', function() {
      ok( true, 'callback can be set at stub creation' );
    });

    window.$$$();
  });

}(this));
