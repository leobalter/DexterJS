# Dexter JS 0.3.1

Dexter is a simple Test Helper to mock and spy methods and to fake the Ajax interface. It's framework independent, running with QUnit, Jasmine, Mocha, etc.

[![Build Status](https://travis-ci.org/leobalter/DexterJS.png?branch=master)](https://travis-ci.org/leobalter/DexterJS)

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/leobalter/DexterJS/master/dist/Dexter.min.js
[max]: https://raw.github.com/leobalter/DexterJS/master/dist/Dexter.js

## Documentation

The project documentation is located in https://github.com/leobalter/DexterJS/wiki

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

### Grunt the code before pushing!
_This assumes you have [node.js](http://nodejs.org/) installed already._

1. To install grunt globally, please run `npm install -g grunt-cli`, it requires at least the version 0.4.2 to make it work.
1. From the root directory of this project, run `npm install --save-dev` to install the project's dependencies.
1. If you change some code in the `src` subdirectory, just run `grunt` and let it do everything: lint the source files with _JSHint_, test the code with _QUnit_, generate coverege reports with _Istanbul_, concatenate the code and minify with _UglifyJS_.

## Last releases

- 2013-12-01 - 0.3.1: Travis-CI integration and Coverage Reports
- 2013-12-01 - 0.3.0: updated grunt
- 2012 - 0.0.x to 0.2.x: first builds, working version.