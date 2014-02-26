/* API Ref: http://api.qunitjs.com */
/* globals Dexter:true, QUnit: true, expect: true */

QUnit.module( 'Environment' );

QUnit.test( 'Dexter is here!', function( assert ) {
    expect( 2 );

    assert.equal( typeof( Dexter ), 'object', 'Dexter is an object' );
    assert.ok( Dexter, 'Dexter is not falsy' );
});

QUnit.test( 'Dexter functions', function( assert ) {
    expect( 3 );

    assert.equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
    assert.equal( typeof( Dexter.fake ), 'function', 'Dexter.fake is a function' );
    assert.equal( typeof( Dexter.fakeXHR ), 'function', 'Dexter.fakeXHR is a function' );
});

QUnit.asyncTest( 'Dexter is here as amd!', function( assert ) {
    expect( 2 );

    require( [ 'dexter' ], function( Dexter ) {
        assert.equal( typeof( Dexter ), 'object', 'Dexter is an object' );
        assert.ok( Dexter, 'Dexter is not falsy' );

        QUnit.start();
    });
});

QUnit.asyncTest( 'Dexter functions as amd', function( assert ) {
    expect( 3 );

    require( [ 'dexter' ], function( Dexter ) {
        assert.equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
        assert.equal( typeof( Dexter.fake ), 'function', 'Dexter.fake is a function' );
        assert.equal( typeof( Dexter.fakeXHR ), 'function', 'Dexter.fakeXHR is a function' );

        QUnit.start();
    });
});
