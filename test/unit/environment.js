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

}( this ) );