# Dexter JS

Dexter is a simple Test Helper, framework independent.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/leobalter/DexterJS/master/dist/Dexter.min.js
[max]: https://raw.github.com/leobalter/DexterJS/master/dist/Dexter.js


## Documentation

This's a Test Helper. With Dexter, you can spy functions and create stubs to prevent their default functionality and set callbacks to create your assertions.

It's like Sinon.JS, but this is VERY simple. The goal is to keep it simple and clean.

Fake Ajax handling is comming soon.

_(More documentation coming soon)_

## Examples

### Dexter.spy

```javascript
var spy = Dexter.spy( console, 'log' );

// Spy doesn't prevent function calls but register them.
console.log( '123' );

spy.called; // 1

// you can restore the spied method to it's default functionality
stub.restore(); 
```

### Dexter.stub

```javascript
var stub = Dexter.stub( console, 'log', function() {
	// please don't ever consider stubbing console.log to make an alert call
	// this is only a cheap example
	alert( 'stub called!' );

	// you can also catch the call arguments
});

// Stub prevent default function calls and you can trigger a callback function
console.log( '123' ); // 'stub called!';

stub.called; // 1

// you can restore the stubbed method to it's default functionality
stub.restore(); 
```

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
