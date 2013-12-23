## Dexter.fake()

Let's suppose you already tested a `function foo()` but you still need to test a new function called `bar()`, you really doesn't need all the work behind `foo()`. 

Dexter.fake will prevent any original functionality of a function, replacing it to a fake and non brainy call. It's like mocks and stubs.

Considering the global scope is a `window` object from a browser and foo is a global function, we can just do fake calls to `foo()`:

```javascript
function bar() {
    var x = foo();
    return x * 2;
}

/*** in your tests: ***/

test( 'bar()', function() {
    var fake  = Dexter.fake( window, 'foo', function() {
                    return 10;
                }),
        returnedValue;

    returnedValue = bar();

    // as you set foo() to always return 10, you now can define 
    // a more precise value returned by bar()
    equal( returnedValue, 20, 'bar() => 20' );

    // fake objects also has called property
    equal( fake.called, 1, 'foo() called once' );

    // restoring foo() 
    fake.restore();

    expect( 2 );  
});
```

Setting callback is very like Dexter.spy, the difference is in the returned value that won't affect spied methods. You can also set or replace the callback function by the `fake.callback` property.

By faking with Dexter you can also verify call `arguments` and the `this` object:

```javascript
function bar() {
    var dummy = {
            'Dexter' : 'JS'
        },
        x = foo.call( dummy, 7 );
    return x * 2;
}

/*** in your tests: ***/

test( 'bar()', function() {
    var fake = Dexter.fake( window, 'foo' ),
        returnedValue;

    fake.callback =  function( arg1 ) {
        var expectedThis = {
            'Dexter' : 'JS'
        };

        equal( arg1, 7, 'arguments[0] === 7' );
        deepEqual( this, expectedThis, 'this === { "Dexter" : "JS" }' );

        return arg1;
    };

    returnedValue = bar();

    equal( returnedValue, 14, 'bar() => 14' );

    equal( fake.called, 1, 'foo() called once' );

    fake.restore();

    expect( 4 );  
});
```