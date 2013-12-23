## Dexter.spy( namespace, 'functionName'[, callbackFn ] )

Setting a spy is an easy way to check for method calls, without preventing their functionality.

This is great to check for called functions inside your tested function.

Suppose you're testing a `function foo()` which in any moment should call `console.log( 'bar' )`. You can set your __spy__ object like this:

```javascript
var spy = Dexter.spy( console, 'log' );
```

And you need to guarantee console.log is called with that `'bar'` argument, so you can implement a callback function to your spy:

```javascript
var spy = Dexter.spy( console, 'log' );
spy.callback = function( arg1 ) {
    // equal is an assertion method based on QUnit
    // you can change it to your best flavor of test framework
    equal( arg1, 'bar', 'arg1 === "bar"' );
};
```

Notice the callback function can also take place as your spy parameter:

```javascript
var spy = Dexter.spy( console, 'log', function( arg1 ) {
    equal( arg1, 'bar', 'arg1 === "bar"' );
});
```

BTW, you can also verify the `this` scope of your spy call

```javascript
var spy = Dexter.spy( console, 'log', function() {
    equal( this, window, 'spy this === window' );
});
```

The callback will be triggered every time the spied function is called, and you can also check on how many times that were called.

```javascript
function foo() {
    console.log( 'bar' );
}

/*** in your tests: ***/

test( 'foo()', function() {
    var spy = Dexter.spy( console, 'log', function( arg1 ) {
        equal( arg1, 'bar', 'arg1 === "bar"' );
    });

    foo();

    // now we check on how many times console.log were called
    equal( spy.called, 1, 'console.log called once' );

    // restoring console.log
    spy.restore();

    expect( 2 );
});
```

Notice we restored the spied function in the above example, so any further calls of before spied `console.log` won't affect this spy object.