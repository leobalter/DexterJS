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

  module( 'fakeXHR' );

  test( 'XMLHttpRequest/ActiveXObject substitutions (also restoring)', function() {
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

  test( 'registering requests', 5, function() {
    var myFake = Dexter.fakeXHR(),
        xhr,
        xhr2;

    strictEqual( myFake.requests.length, 0, 'myFake.requests.length === 0 (before new XHR)' );
    xhr = getXHR();
    strictEqual( myFake.requests.length, 1, 'myFake.requests.length === 1 (after new XHR)' );
    strictEqual( myFake.requests[0], xhr, 'myFake.requests[0] === xhr object' );

    xhr2 = getXHR();
    strictEqual( myFake.requests.length, 2, 'myFake.requests.length === 1 (after new XHR)' );
    strictEqual( myFake.requests[1], xhr2, 'myFake.requests[0] === xhr object' );

    myFake.restore();
  }); 

  test( 'fakeXHR.respond without index', 4, function() {
    var myFake = Dexter.fakeXHR(),
        xhr = getXHR(),
        stub = Dexter.stub( xhr, '__DexterRespond' ),
        params = { 
            body : 'foo' 
        };

    stub.callback = function( arg1 ) {
      strictEqual( arg1, params, '__DexterRespond called with .respond first argument' );
      strictEqual( this, xhr, '__DexterRespond this === xhr' );
    };

    xhr.open( 'GET', '/' );
    xhr.send();

    deepEqual( myFake.doneRequests, [], 'doneRequests === []' );

    myFake.respond( params );

    strictEqual( myFake.doneRequests[0], xhr, 'doneRequests receives xhr object' );

    myFake.restore();
    stub.restore();
  });

  test( 'fakeXHR.respond with index', 3, function() {
    var myFake = Dexter.fakeXHR(),
        xhr = getXHR(),
        xhr2 = getXHR(),
        stub = Dexter.stub( xhr2, '__DexterRespond' ),
        params = { 
            body : 'foo' 
        }; 

    stub.callback = function( arg1 ) {
      strictEqual( this, xhr2, '__DexterRespond this === xhr' );
    };

    xhr2.open( 'GET', '/' );
    xhr2.send();

    deepEqual( myFake.doneRequests, [], 'doneRequests === []' );

    myFake.respond( params, 1 );

    strictEqual( myFake.doneRequests[0], xhr2, 'doneRequests receives xhr object' );

    myFake.restore();
    stub.restore();
  });

}( this ) );