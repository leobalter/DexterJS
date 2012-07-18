# Dexter JS

Dexter is a simple Test Helper, framework independent.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/leobalter/DexterJS/master/dist/Dexter.min.js
[max]: https://raw.github.com/leobalter/DexterJS/master/dist/Dexter.js


## Documentation

Dexter is a Test Helper. With Dexter, you can spy functions and create stubs to prevent their default functionality and set callbacks to create your assertions.

It's like [Sinon.JS](http://sinonjs.org/), but this is VERY simple. The goal is to keep it simple and clean.

### Dexter.spy( namespace, 'functionName'[, callbackFn ] )

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

### Dexter.stub()

Let's suppose you already tested a `function foo()` but you still need to test a new function called `bar()`, you really doesn't need all the work behind `foo()`. 

Dexter.stub will prevent any original functionality of the stubbed function, replacing it to a fake and non brainy call. 

Considering the global scope is a `window` object from a browser and foo is a global function, we can just fake calls to `foo()`:

```javascript
function bar() {
    var x = foo();
    return x * 2;
}

/*** in your tests: ***/

test( 'bar()', function() {
    var stub  = Dexter.stub( window, 'foo', function() {
                    return 10;
                }),
        returnedValue;

    returnedValue = bar();

    // as you set foo() to always return 10, you now can define 
    // a more precise value returned by bar()
    equal( returnedValue, 20, 'bar() => 20' );

    // stub objects also has called property
    equal( stub.called, 1, 'foo() called once' );

    // unstubbing/restoring foo() 
    stub.restore();

    expect( 2 );  
});
```

Setting callback is very like Dexter.spy, the difference is in the returned value that won't affect spied methods. You can also set or replace the callback function by the `stub.callback` property.

Using stubs you can also verify call `arguments` and the `this` object:

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
    var stub = Dexter.stub( window, 'foo' ),
        returnedValue;

    stub.callback =  function( arg1 ) {
        var expectedThis = {
            'Dexter' : 'JS'
        };

        equal( arg1, 7, 'arguments[0] === 7' );
        deepEqual( this, expectedThis, 'this === { "Dexter" : "JS" }' );

        return arg1;
    };

    returnedValue = bar();

    equal( returnedValue, 14, 'bar() => 14' );

    equal( stub.called, 1, 'foo() called once' );

    stub.restore();

    expect( 4 );  
});
```

### Dexter.fakeXHR()

Dexter also fakes Ajax methods, this is great to speed up your tests and avoid server requisites. Using `Dexter.fakeXHR` you won't need to set a server. fakeXHR is just a disguise method, and you can restore XHR methods at any time.

Dexter.fakeXHR methods were based on `Sinon.JS`. Similar calls are not mere coincidence.

Supposing we have a `ajax()` function that sets an Ajax request, we need to test it without really opening a request and avoid server's latency:

```javascript
function ajax( method, url, data, callback ) {
    var xhr;

    // Remember this is an dumb example and you can do 
    // better to make ajax requests or use great libraries
    // to abstract this in a good design pattern.
    try {
        xhr = new XMLHttpRequest();
    } catch ( e ) {
        try {
            xhr = new ActiveXObject( 'Microsoft.XMLHTTP' );
        } catch ( e ) { 
            /* no country for old browsers */
        }
    }

    xhr.onreadystatechange = function() {
        if ( this.readyState === 4 ) {
            callback();
        }
    };

    xhr.open( method, url, true );

    xhr.send( data );

    return xhr;
}
```

Now we're going to test this:

```javascript
test( 'ajax()', 2, function() {
    // this is where we fake XHR calls
    var fakeXHR = Dexter.fakeXHR(),
        xhr = ajax( 'GET', '/ajax.php', { foo : 'bar' }, function() {
            ok( true, 'ajax completed' );
        });

    // opening an fake ajax request will register its object to the fakeXHR instance:
    strictEqual( fakeXHR.requests[0], xhr, 'fakeXHR.requests[0] === xhr' );

    // And now we can respond the fake Ajax call:
    fakeXHR.respond({
        body : 'this is the ajax returned text',
        // optional setting response header
        headers : { foo2 : 'bar2' },
        // the status code (200 is default)
        status : 200
    });

    // after completing a request, you can notice the xhr object 
    // have been moved to fakeXHR.doneRequests collection
});
```

You can also handle multiple Ajax requests:

```javascript
test( 'ajax()', 2, function() {
    // this is where we fake XHR calls
    var fakeXHR = Dexter.fakeXHR(),
        xhr1 = ajax( 'GET', '/ajax1.php', {}, function() {
            ok( true, 'ajax 1 completed' );
        }),
        xhr2 = ajax( 'GET', '/ajax2.php', {}, function() {
            ok( true, 'ajax 2 completed' );
        }),
        xhr3 = ajax( 'GET', '/ajax3.php', {}, function() {
            ok( true, 'ajax 3 completed' );
        }),
        index = 2;

    // now fakeXHR.requests.length is 3

    // we can set an array index as a array param in fakeXHR.respond:
    fakeXHR.respond({
        body : 'ajax returned text'
    }, index );

    // we just got the ok() for xhr3

    // without the index parameter, respond() will get the first request in line
    // the first is considered the oldest in fakeXHR.requests collection
    fakeXHR.respond({
        body : 'other ajax returned text'
    });

    // now we got the ok() for xhr1 (first placed request)
});
```

_(More documentation coming soon)_


## Release History
2012-07-11 - initial release, stub and spy ready and tested

## License
Copyright (c) 2012 Leonardo Balter  
Licensed under the MIT, GPL licenses.

## Contributing

1. In lieu of a formal styleguide, take care to maintain the existing coding style and please do follow [idiomatic.js](https://github.com/rwldrn/idiomatic.js).
2. Add unit tests for any new or changed functionality. 
3. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

### Important notes
Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

### Installing grunt
_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
1. If grunt isn't installed globally, run `npm install -g grunt` to install the latest version. _You may need to run `sudo npm install -g grunt`._
1. From the root directory of this project, run `npm install` to install the project's dependencies.

### Installing PhantomJS

In order for the qunit task to work properly, [PhantomJS](http://www.phantomjs.org/) must be installed and in the system PATH (if you can run "phantomjs" at the command line, this task should work).

Unfortunately, PhantomJS cannot be installed automatically via npm or grunt, so you need to install it yourself. There are a number of ways to install PhantomJS.

* [PhantomJS and Mac OS X](http://ariya.ofilabs.com/2012/02/phantomjs-and-mac-os-x.html)
* [PhantomJS Installation](http://code.google.com/p/phantomjs/wiki/Installation) (PhantomJS wiki)

Note that the `phantomjs` executable needs to be in the system `PATH` for grunt to see it.

* [How to set the path and environment variables in Windows](http://www.computerhope.com/issues/ch000549.htm)
* [Where does $PATH get set in OS X 10.6 Snow Leopard?](http://superuser.com/questions/69130/where-does-path-get-set-in-os-x-10-6-snow-leopard)
* [How do I change the PATH variable in Linux](https://www.google.com/search?q=How+do+I+change+the+PATH+variable+in+Linux)
