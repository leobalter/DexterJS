'use strict';

var Dexter = require( '../src/Dexter' );

exports.Environment = {
    'Dexter is Here!': function( test ) {
        test.expect( 2 );
        test.equal( typeof( Dexter ), 'object', 'Dexter is an object');
        test.ok( Dexter, 'Dexter is not falsy' );
        test.done();
    },
    'Dexter functions': function( test ) {
        test.expect( 3 );
        test.equal( typeof( Dexter.spy ), 'function', 'Dexter.spy is a function' );
        test.equal( typeof( Dexter.fake ), 'function', 'Dexter.fake is a function' );
        test.equal( typeof( Dexter.fakeXHR ), 'undefined', 'Dexter.fakeXHR is a not function on Node environment' );
        test.done();
    }
};

exports.Fake = {
    setUp: function( callback ) {
        this.foo = {};
        this.foo.bar = function( test ) {
            test.expect( 1 );
            test.ok( false, 'fake shoud not call original method' );
            test.done();
        };
        this.fake = Dexter.fake( this.foo, 'bar' );
        callback();
    },
    'returned object': function( test ) {
        test.expect( 2 );
        test.equal( typeof this.fake, 'object', 'Dexter.fake returns and object' );
        test.ok( this.fake.isActive, 'fake.isActive === true' );
        test.done();
    },
    'call count': function( test ) {
        var i;
        test.expect( 11 );
        for ( i = 0 ; i < 11 ; ++i ) {
            test.deepEqual( this.fake.called, i, 'fake.called === ' + i );
            this.foo.bar();
        }
        test.done();
    },
    'restore()': function( test ) {
        this.foo.otherBar = function() {
            test.ok( true, 'fake restore objects' );
        };

        var fake = Dexter.fake( this.foo, 'otherBar' );
        fake.restore();
        this.foo.otherBar();

        test.deepEqual( fake.called, 0, 'restored fake should not be affected by further calls' );
        test.deepEqual( fake.isActive, false, 'fake.isActive === false after restoring' );
        test.done();
    },
    'callback': function( test ) {
        this.fake.callback = function( a, b, c ) {
            test.ok( true, '.callback is set' );
            test.deepEqual( [ a, b, c ], [ 1, 2, 3 ], 'callback arguments working' );
        };

        this.foo.bar( 1, 2, 3 );

        this.fake.restore();

        this.fake = Dexter.fake( this.foo, 'bar', function() {
            test.ok( true, 'callback can be set at fake creation' );
            return 17;
        });

        test.strictEqual( this.foo.bar(), 17, 'fake returned value set in callback' );
        test.done();
    }
};

exports.Restore = {
    setUp: function( callback ) {
        this.myMock1 = function() {};
        this.myMock2 = function() {};
        this.myMock3 = function() {};

        this.fakes = [];
        this.fakes.push( Dexter.fake( this, 'myMock1' ) );
        this.fakes.push( Dexter.fake( this, 'myMock2' ) );
        this.fakes.push( Dexter.spy( this, 'myMock3' ) );
        callback();
    },    
    tearDown: function( callback ) {
        while ( this.fakes.length ) {
            this.fakes.pop().restore();
        }
        callback();
    },
    'storing methods': function( test ) {
        var fakes = this.fakes,
            stored = Dexter.stored,
            item;
        test.expect( 3 );
        while ( fakes.length ) {
            item = fakes.pop();
            test.strictEqual( stored.pop(), item, 'Dexter stored item' );

            item.restore();
        }
        test.done();
    },
    'restoring': function( test ) {
        test.expect( 3 );
        test.ok( Dexter.stored.length >= 3, 'Dexter.stored has items' );
        test.ok( Dexter.restore(), 'Dexter.restore() => true' );
        test.strictEqual( Dexter.stored.length, 0, 'Dexter.stored empty after Dexter.restore()' );
        test.done();
    },
    'restoring for sure': function( test ) {
        test.expect( 1 );
        this.myFn = function() {
            test.ok( true, 'restored function working' );
            test.done();
        };

        Dexter.fake( this, 'myFn', function() {
            throw 'do not call me';
        });

        Dexter.restore();

        this.myFn();
    }

};

exports.Spy = {
    setUp: function( callback ) {
        this.foo = {};
        this.foo.bar = function( test ) {
            test.ok( true, 'spy preserve method calling' );
            return 'foo!';
        };
        this.spy = Dexter.spy( this.foo, 'bar' );
        callback();
    },
    'returned object': function( test ) {
        test.expect( 5 );
        test.equal( typeof( this.spy ), 'object', 'Dexter.spy returns and object' );
        test.ok( this.spy.isActive, 'spy.isActive === true' );

        test.throws( function() {
            Dexter.spy( this.foo, 'whateverDoesntExist' );
        }, 'raises an error if method doesnt exist' );

        test.throws( function() {
            Dexter.spy();
        }, 'raises an error without arguments' );

        test.throws( function() {
            Dexter.spy( this.foo, function() {} );
        }, 'raises an error if method name isn\'t a string' );
        test.done();
    },
    'restore()': function( test ) {
        test.expect( 3 );
        this.spy.restore();

        // 1 ok
        this.foo.bar(test);

        test.deepEqual( this.spy.called, 0, 'restored spy should not be affected by further calls' );
        test.deepEqual( this.spy.isActive, false, 'spy.isActive === false after restoring' );
        test.done();
    },
    'call count': function( test ) {
        test.expect( 22 );
        var i;
        for ( i = 0 ; i < 11 ; ++i ) {
            test.deepEqual( this.spy.called, i, 'spy.called === ' + i );
            this.foo.bar(test);
        }
        test.done();
    },
    'arguments': function( test ) {
        test.expect( 1 );
        this.foo.otherBar = function( a, b, c ) {
            test.deepEqual( [ a, b, c ], [ 'Dexter', 'is', 'here!' ], 'keeping arguments in the spied call' );
        };

        Dexter.spy( this.foo, 'otherBar' );

        this.foo.otherBar( 'Dexter', 'is', 'here!' );
        test.done();
    },
    'callback()': function( test ) {
        test.expect( 6 );
        this.spy.callback = function( t, a, b, c ) {
            test.ok( true, '.callback is set' );
            test.deepEqual( [ t, a, b, c ], [ test, 1, 2, 3 ], 'callback arguments working' );
        };

        this.foo.bar( test, 1, 2, 3 );

        this.spy.restore();

        this.spy = Dexter.spy( this.foo, 'bar', function() {
            test.ok( true, 'callback can be set at spy creation' );
            return 'bar!';
        });

        test.strictEqual( this.foo.bar(test), 'foo!', 'spy preserves returned value' );
        test.done();
    },
    'callback() order': function( test ) {
        test.expect( 1 );
        var foo = '';

        Dexter.__bar__ = function() {
            foo = 'a';
        };

        Dexter.spy( Dexter, '__bar__', function() {
            foo += 'b';
        });

        Dexter.__bar__();

        test.strictEqual( foo, 'ab', 'callback called after spied function' );
        test.done();
    }
};
