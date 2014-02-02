/* API Ref: http://api.qunitjs.com */
/* globals Dexter:true, QUnit: true, expect: true */

QUnit.module( 'fakeXHR', {
    setup: function() {
        this.getXHR = function() {
            try {
                return new XMLHttpRequest();
            } catch ( e ) {}

            try {
                return new ActiveXObject( 'Microsoft.XMLHTTP' );
            } catch ( e ) {}

            throw 'No supported XHR Object';
        };
    },
    teardown: function() {
        Dexter.restore();
    }
});

QUnit.test( 'XMLHttpRequest/ActiveXObject substitutions (also restoring)', function( assert ) {
    var myFake,
        expected = 0;

    // Can´t run some tests regarding browser limitations
    if ( window.XMLHttpRequest ) {
        expected += 3;

        assert.strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'untouched XMLHttpRequest' );

        myFake = Dexter.fakeXHR();
        assert.ok( XMLHttpRequest.prototype.__DexterXHR, 'Dexter fakes XMLHttpRequest' );

        myFake.restore();
        assert.strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'original XMLHttpRequest after .restore() ' );
    }

    if ( window.ActiveXObject ) {
        expected += 3;

        assert.strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'untouched ActiveXObject' );

        myFake = Dexter.fakeXHR();
        assert.ok( XMLHttpRequest.prototype.__DexterXHR, 'Dexter fakes ActiveXObject' ); 

        myFake.restore();
        assert.strictEqual( typeof( XMLHttpRequest.prototype.__DexterXHR ), 'undefined', 'original ActiveXObject after .restore() ' );
    }

    expect( expected );
});

QUnit.test( 'registering requests', function( assert ) {
    expect( 5 );

    var myFake = Dexter.fakeXHR(),
        xhr,
        xhr2;

    assert.strictEqual( myFake.requests.length, 0, 'myFake.requests.length === 0 (before new XHR)' );
    xhr = this.getXHR();
    assert.strictEqual( myFake.requests.length, 1, 'myFake.requests.length === 1 (after new XHR)' );
    assert.strictEqual( myFake.requests[0], xhr, 'myFake.requests[0] === xhr object' );

    xhr2 = this.getXHR();
    assert.strictEqual( myFake.requests.length, 2, 'myFake.requests.length === 1 (after new XHR)' );
    assert.strictEqual( myFake.requests[1], xhr2, 'myFake.requests[0] === xhr object' );

    myFake.restore();
}); 

QUnit.test( 'fakeXHR.respond without index', function( assert ) {
    expect( 4 );

    var myFake = Dexter.fakeXHR(),
        xhr = this.getXHR(),
        fake = Dexter.fake( xhr, '__DexterRespond' ),
        params = { 
            body: 'foo' 
        };

    fake.callback = function( arg ) {
        assert.strictEqual( arg, params, '__DexterRespond called with .respond first argument' );
        assert.strictEqual( this, xhr, '__DexterRespond this === xhr' );
    };

    xhr.open( 'GET', '/' );
    xhr.send();

    assert.deepEqual( myFake.doneRequests, [], 'doneRequests === []' );

    myFake.respond( params );

    assert.strictEqual( myFake.doneRequests[ 0 ], xhr, 'doneRequests receives xhr object' );

    myFake.restore();
    fake.restore();
});

QUnit.test( 'fakeXHR.respond with index', function( assert ) {
    expect( 3 );

    var myFake = Dexter.fakeXHR(),
        xhr = this.getXHR(),
        xhr2 = this.getXHR(),
        fake = Dexter.fake( xhr2, '__DexterRespond' ); 

    fake.callback = function() {
        assert.strictEqual( this, xhr2, '__DexterRespond this === xhr' );
    };

    xhr.open( 'GET', '/' );
    xhr.send();

    xhr2.open( 'GET', '/' );
    xhr2.send();

    assert.deepEqual( myFake.doneRequests, [], 'doneRequests === []' );

    myFake.respond( { body: 'foo' }, 1 );    

    assert.strictEqual( myFake.doneRequests[ 0 ], xhr2, 'doneRequests receives xhr object' );

    myFake.restore();
    fake.restore();
});

QUnit.test( 'fakeXHR.spy and sync ajax Calls', function( assert ) {
    expect( 2 );

    var myFake = Dexter.fakeXHR(),
        xhr = this.getXHR();
    
    myFake.spy( function() {
        assert.ok( true, 'fakeXHR.spy called' );
        myFake.respond({
            body: 'bar'
        });
    });

    xhr.open( 'GET', '/', false );
    xhr.send();

    assert.strictEqual( xhr.responseText, 'bar', 'fakeXHR.respond inside spy worked with a sync XHR' );

    myFake.restore();
});
