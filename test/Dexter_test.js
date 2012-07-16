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

  test( 'Dexter is here!', 2, function() {
    equal( typeof( Dexter ), 'object', 'Dexter is an object' );
    ok( Dexter, 'Dexter is not falsy' );
  });

  test( 'Dexter functions', 3, function() {
    equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
    equal( typeof( Dexter.stub ), 'function', 'Dexter.stub is a function' );
    equal( typeof( Dexter.fakeXHR ), 'function', 'Dexter.fakeXHR is a function' );
  });

  module( 'Dexter Spy', {
    setup : function() {
      foo.bar = function() {
        ok( true, 'spy preserve method calling' );
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

  test( 'callback()', 5, function() {
    this.spy.callback = function( a, b, c ) {
      ok( true, '.callback is set' );
      deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
    };

    foo.bar( 1, 2, 3 );

    this.spy.restore();

    this.spy = Dexter.spy( foo, 'bar', function() {
      ok( true, 'callback can be set at spy creation' );
    });

    foo.bar();
  });

  module( 'Dexter Stub', {
    setup : function() {
      foo.bar = function() {
        ok( false, 'stub shoud not call original stubbed method' );
      };
      this.stub = Dexter.stub( foo, 'bar' );
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
      foo.bar();
    }
  });

  test( 'restore()', function() {
    foo.otherBar = function() {
      ok( true, 'stub restore objects' );
    };

    var stub = Dexter.stub( foo, 'otherBar' );

    stub.restore();

    foo.otherBar();

    deepEqual( stub.called, 0, 'restored stub should not be affected by further calls' );
    deepEqual( stub.isActive, false, 'stub.isActive === false after restoring' );
  });

  test( 'callback()', 3, function() {
    this.stub.callback = function( a, b, c ) {
      ok( true, '.callback is set' );
      deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
    };

    foo.bar( 1, 2, 3 );

    this.stub.restore();

    this.stub = Dexter.stub( foo, 'bar', function() {
      ok( true, 'callback can be set at stub creation' );
    });

    foo.bar();
  });

  module( 'fakeXHR' );

  test( 'XMLHttpRequest substitution', function() {
    var myFake,
        expected = 0;

    // Can´t run some tests regarding browser limitations
    if ( window.XMLHttpRequest ) {
      expected += 3;

      strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'untouched XMLHttpRequest' );

      myFake = Dexter.fakeXHR();
      ok( XMLHttpRequest.prototype.__DexterXHR, 'Dexter fakes XMLHttpRequest' );

      myFake.restore();
      strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'original XMLHttpRequest after .restore() ' );
    }

    if ( window.ActiveXObject ) {
      expected += 3;

      strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'untouched ActiveXObject' );

      myFake = Dexter.fakeXHR();
      ok( XMLHttpRequest.prototype.__DexterXHR, 'Dexter fakes ActiveXObject' );

      myFake.restore();
      strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'original ActiveXObject after .restore() ' );
    }

    expect( expected );
    
  });


}(this));
