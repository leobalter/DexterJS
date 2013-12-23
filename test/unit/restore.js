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

    module( 'Dexter.restore()', {
        setup : function () {
            this.myMock1 = function() {};
            this.myMock2 = function() {};
            this.myMock3 = function() {};

            this.fakes = [];
            this.fakes.push( Dexter.fake( this, 'myMock1' ) );
            this.fakes.push( Dexter.fake( this, 'myMock2' ) );
            this.fakes.push( Dexter.spy( this, 'myMock3' ) );
        },
        teardown : function() {
            while( this.fakes.length ) {
                this.fakes.pop().restore();
            }
        }
    });

    test( 'storing methods', 3, function () {
        var fakes = this.fakes,
            stored = Dexter.stored,
            item;

        while ( fakes.length ) {
            item = fakes.pop();
            strictEqual( stored.pop(), item, 'Dexter stored item' );

            item.restore();
        }
    });

    test( 'restoring', function () {
        ok( Dexter.stored.length >= 3, 'Dexter.stored has items' );

        ok( Dexter.restore(), 'Dexter.restore() => true' );

        strictEqual( Dexter.stored.length, 0, 'Dexter.stored empty after Dexter.restore()' );
    });

    test( 'restoring for sure', 1, function () {
        this.myFn = function () {
            ok( true, 'restored function working' );
        };

        Dexter.fake( this, 'myFn', function () {
            throw 'do not call me';
        });

        Dexter.restore();

        this.myFn();
    });

}( this ) );
