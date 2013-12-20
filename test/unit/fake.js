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

    module( 'Dexter fake', {
        setup : function() {
            foo.bar = function() {
                ok( false, 'fake shoud not call original method' );
            };
            this.fake = Dexter.fake( foo, 'bar' );
        }
    });

    test( 'returned object', 2, function() {
        equal( typeof( this.fake ), 'object', 'Dexter.fake returns and object' );
        ok( this.fake.isActive, 'fake.isActive === true' );
    });

    test( 'call count', 11, function() {
        var i;
        for ( i = 0 ; i < 11 ; ++i ) {
            deepEqual( this.fake.called, i, 'fake.called === ' + i );
            foo.bar();
        }
    });

    test( 'restore()', function() {
        foo.otherBar = function() {
            ok( true, 'fake restore objects' );
        };

        var fake = Dexter.fake( foo, 'otherBar' );

        fake.restore();

        foo.otherBar();

        deepEqual( fake.called, 0, 'restored fake should not be affected by further calls' );
        deepEqual( fake.isActive, false, 'fake.isActive === false after restoring' );
    });

    test( 'callback()', 4, function() {
        this.fake.callback = function( a, b, c ) {
            ok( true, '.callback is set' );
            deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
        };

        foo.bar( 1, 2, 3 );

        this.fake.restore();

        this.fake = Dexter.fake( foo, 'bar', function() {
            ok( true, 'callback can be set at fake creation' );
            return 17;
        });

        strictEqual( foo.bar(), 17, 'fake returned value set in callback' );
    });
}( this ) );
