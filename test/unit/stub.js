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
}( this ) );