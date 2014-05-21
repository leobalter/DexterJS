/* API Ref: http://api.qunitjs.com */
/* globals QUnit: true, expect: true */

(function() {

    var Dexter;

    // NPM scope
    if ( !Dexter && typeof module !== 'undefined' && module.exports ) {
        Dexter = require( '../../src/Dexter.js' );
    } else {
        Dexter = window.Dexter;
    }

    QUnit.module( 'Dexter.restore()', {
        setup: function() {
            this.myMock1 = function() {};
            this.myMock2 = function() {};
            this.myMock3 = function() {};

            this.fakes = [];
            this.fakes.push( Dexter.fake( this, 'myMock1' ) );
            this.fakes.push( Dexter.fake( this, 'myMock2' ) );
            this.fakes.push( Dexter.spy( this, 'myMock3' ) );
        },
        teardown: function() {
            while ( this.fakes.length ) {
                this.fakes.pop().restore();
            }
        }
    });

    QUnit.test( 'storing methods', function( assert ) {
        expect( 3 );

        var fakes = this.fakes,
            stored = Dexter.stored,
            item;

        while ( fakes.length ) {
            item = fakes.pop();
            assert.strictEqual( stored.pop(), item, 'Dexter stored item' );

            item.restore();
        }
    });

    QUnit.test( 'restoring', function( assert ) {
        assert.ok( Dexter.stored.length >= 3, 'Dexter.stored has items' );

        assert.ok( Dexter.restore(), 'Dexter.restore() => true' );

        assert.strictEqual( Dexter.stored.length, 0, 'Dexter.stored empty after Dexter.restore()' );
    });

    QUnit.test( 'restoring for sure', function( assert ) {
        expect( 1 );

        this.myFn = function() {
            assert.ok( true, 'restored function working' );
        };

        Dexter.fake( this, 'myFn', function() {
            throw 'do not call me';
        });

        Dexter.restore();

        this.myFn();
    });

}());
