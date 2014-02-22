/* API Ref: http://api.qunitjs.com */
/* globals Dexter:true, QUnit: true, expect: true */

(function() {

	'use strict';

	QUnit.module( 'XHR methods', {
		setup: function() {
			this.myFake = Dexter.fakeXHR();
			this.xhr = (function() {
				try {
					return new XMLHttpRequest();
				} catch ( e ) {}

				try {
					return new ActiveXObject( 'Microsoft.XMLHTTP' );
				} catch ( e ) {}
			}());
		},
		teardown: function() {
			this.myFake.restore();
		}
	});

	QUnit.test( '.open()', function( assert ) {
		expect( 9 );

		var xhr = this.xhr;

		assert.throws(function() {
			xhr.open();
		}, 'xhr.open() [no args] raises error' );

		assert.throws(function() {
			xhr.open( 'GET' );
		}, 'xhr.open( "GET" ) [1 arg] raises error' );

		assert.strictEqual( xhr.readyState, 0, 'readyState starts at 0' );

		xhr.open( 'GET', '/' );

		assert.strictEqual( xhr.readyState, 1, 'readyState == 1 after .open()' );
		assert.strictEqual( xhr.async, true, 'xhr.async defaults to true' );
		assert.strictEqual( xhr.sendFlag, false, 'xhr.sendFlag === false' );

		xhr.open( 'POST', '/', false, 'leo', 'balter' );

		assert.strictEqual( xhr.async, false, 'xhr.async false setting' );
		assert.strictEqual( xhr.username, 'leo' );
		assert.strictEqual( xhr.password, 'balter' );
	});

	QUnit.test( '.open() => readyStateChange event', function( assert ) {
		expect( 3 );

		var xhr = this.xhr;

		xhr.onreadystatechange = function( ev ) {
			assert.ok( true, 'readyStateChange event fired' );
			assert.strictEqual( this, xhr, 'xhr object === this' );
			assert.equal( ev[0].type, 'readystatechange', 'ev.type === readystatechange' );
		};

		xhr.open( 'GET', '/' );
	});

	QUnit.test( '.abort()', function( assert ) {
		expect( 4 );

		var xhr = this.xhr;

		xhr.open( 'GET', '/' );

		xhr.abort();

		assert.strictEqual( xhr.readyState, 0, 'aborted xhr.readyState returns to 0' );
		assert.ok( xhr.aborted, 'xhr.aborted === true' );
		assert.strictEqual( xhr.sendFlag, false, 'xhr.sendFlag === false' );
		assert.ok( xhr.errorFlag, 'xhr.errorFlag === true' );
	});

	QUnit.test( '.abort() => readyStateChange event', function( assert ) {
		expect( 1 );

		var xhr = this.xhr;

		xhr.open( 'GET', '/' );
		xhr.onreadystatechange = function() {
			assert.ok( true, 'readystatechange event fired on .abort()' );
		};

		xhr.abort();
	});

	QUnit.test( '.setRequestHeader()', function( assert ) {
		expect( 7 );

		var xhr = this.xhr;

		assert.throws(function() {
			xhr.setRequestHeader();
		}, 'calling setRequestHeaders without readyState === 1 raises an error' );

		xhr.open( 'GET', '/' );

		xhr.sendFlag = true;
		assert.throws(function() {
			xhr.setRequestHeader();
		}, 'calling setRequestHeaders with xhr.sendFlag == true raises an error' );

		xhr.sendFlag = false;

		assert.throws(function() {
			xhr.setRequestHeader( 'Keep-Alive', '123' );
		}, 'unsafe header raises an error' );

		assert.throws(function() {
			xhr.setRequestHeader( 'Sec-Test', '123' );
		}, 'unsafe header (Sec-) raises an error' );

		assert.throws(function() {
			xhr.setRequestHeader( 'Proxy-Test', '123' );
		}, 'unsafe header (Proxy-) raises an error' );

		xhr.setRequestHeader( 'Dexter', 'JS' );

		assert.deepEqual( xhr.requestHeaders, { 'Dexter': 'JS' }, 'requestHeader is set' );

		xhr.setRequestHeader( 'Dexter', 'JS' );

		assert.deepEqual( xhr.requestHeaders, { 'Dexter': 'JS,JS' }, 'requestHeader concatenates the value' );
	});

	QUnit.test( '.getResponseHeader()', function( assert ) {
		expect( 4 );

		var xhr = this.xhr;

		xhr.open( 'GET', '/' );

		xhr.responseHeaders = { 'Dexter': 'JS' };

		assert.equal( xhr.getResponseHeader( 'Dexter' ), null, 'without readyState == 2, getResponseHeader returns null' );

		// 2 == HEADERS_RECEIVED
		xhr.readyState = 2;

		assert.strictEqual( xhr.getResponseHeader( 'Dexter' ), 'JS', 'getResponseHeader returns header value' );

		assert.equal( xhr.getResponseHeader( 'Set-Cookie2' ), null, 'Set-Cookie2 in getResponseHeader returns null' );

		assert.equal( xhr.getResponseHeader( 'Nothing' ), null, 'no header => null return' );
	});

	QUnit.test( '.send()', function( assert ) {
		expect( 6 );

		var xhr = this.xhr;

		xhr.sendFlag = false;
		assert.throws(function() {
			xhr.send( 'a=a' );
		}, 'send() before open raises an error' );

		xhr.open( 'GET', '/' );
		xhr.sendFlag = true;
		assert.throws(function() {
			xhr.send( 'a=b' );
		}, 'send() with xhr.sendFlag = true raises an error' );

		xhr.sendFlag = false;

		xhr.onSend = function() {
			assert.ok( true, '.onSend callback' );
		};

		xhr.onreadystatechange = function() {
			assert.ok( true, '.onreadystatechange callback' );
		};

		xhr.send( 'a=c' );

		assert.equal( xhr.readyState, 1, 'opened readyState' );
		assert.strictEqual( xhr.errorFlag, false, 'falsy errorFlag' );
	});

	QUnit.test( '.getAllResponseHeaders()', function( assert ) {
		var xhr = this.xhr,
			returned;

		xhr.responseHeaders = {
			testA: '1',
			testB: '2',
			testC: '3'
		};

		xhr.readyState = 0;
		returned = xhr.getAllResponseHeaders();
		assert.strictEqual( returned, '', 'with readyState == 0 returns \'\'' );

		xhr.readyState = 1;
		returned = xhr.getAllResponseHeaders();
		assert.strictEqual( returned, '', 'with readyState == 1 returns \'\'' );

		xhr.readyState = 2;
		returned = xhr.getAllResponseHeaders();
		assert.strictEqual( returned, 'testA: 1\r\ntestB: 2\r\ntestC: 3\r\n', 'with readyState == 2 return responseHeaders' );
	});

	QUnit.test( '.__DexterSetResponseHeaders()', function( assert ) {
		expect( 6 );

		var xhr = this.xhr,
			foo = {
				testA: '1',
				testB: '2'
			},
			fooCount = 0;

		xhr.async = true;
		xhr.readyState = 0;
		xhr.onreadystatechange = function() {
			assert.ok( true, 'readystatechange callback' );
		};
		xhr.__DexterSetResponseHeaders( foo );

		assert.deepEqual( xhr.responseHeaders, foo, 'xhr.responseHeaders are set' );
		assert.strictEqual( xhr.readyState, 2, 'xhr.readyState === 2' );

		foo.testA = 'AA';
		xhr.async = false;
		xhr.readyState = 0;
		xhr.onreadystatechange = function() {
			assert.ok( false, 'it\'s a trap' );
			fooCount += 1;
		};
		xhr.__DexterSetResponseHeaders( foo );

		assert.deepEqual( xhr.responseHeaders, foo, 'xhr.responseHeaders are re-set' );
		assert.strictEqual( fooCount, 0, 'async false won\'t trigger readystatechange' );
		assert.strictEqual( xhr.readyState, 0, 'xhr.readyState === 0 (async === false)' );
	});

	QUnit.test( '.__DexterSetResponseBody()', function( assert ) {
		expect( 21 );

		var xhr = this.xhr,
			textContent = '',
			foo = 'Dexter is a simple Test Helper, framework independent.',
			count = 0,
			bar = [
				'',
				'Dexter is ',
				'Dexter is a simple T',
				'Dexter is a simple Test Helper',
				'Dexter is a simple Test Helper, framewor',
				'Dexter is a simple Test Helper, framework independ'
			];

		xhr.responseText = '';
		xhr.async = true;
		xhr.onreadystatechange = function() {
			assert.ok( true, 'readyStateChange triggered. Count == ' + count );
			assert.strictEqual( xhr.readyState, 3, 'xhr.readyState === 3. Count == ' + count );
			assert.strictEqual( xhr.responseText, bar[ count ], 'loading status return text from 10 to 10 chars. "' + bar[ count ] + '"' );
			count++;
		};

		xhr.__DexterSetResponseBody( foo );

		assert.equal( xhr.responseText, foo, 'xhr.responseText is set' );

		foo = '<js>Dexter</js>';
		xhr.responseText = '';
		xhr.responseHeaders = {
			'Content-Type': 'text/xml'
		};
		xhr.async = false;
		xhr.__DexterSetResponseBody( foo );

		// .text for IE8
		textContent = xhr.responseXML.childNodes[0].textContent || xhr.responseXML.childNodes[0].text;

		assert.strictEqual( xhr.responseXML.childNodes[0].tagName, 'js', 'xml tagName is set' );
		assert.strictEqual( textContent, 'Dexter', 'xml textContent is set' );
	});

	QUnit.test( '__DexterRespond', function( assert ) {
		expect( 9 );

		var xhr = this.xhr,
			params = {
				body: 'Dexter is a simple Test Helper, framework independent.',
				headers: { foo: 'bar' }
			},
			// yay! using a spy
			spyResponseBody = Dexter.spy( xhr, '__DexterSetResponseBody' ),
			spyResponseHeaders = Dexter.spy( xhr, '__DexterSetResponseHeaders' );

		xhr.async = true;
		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 ) {
				assert.ok( true, 'readystatechange / readyState === 4' );
			}
		};
		spyResponseBody.callback = function( spyParam ) {
			assert.strictEqual( spyParam, params.body, 'xhr.__DexterSetResponseBody receives params.body' );
		};
		spyResponseHeaders.callback = function( spyParam ) {
			assert.strictEqual( spyParam, params.headers, 'xhr.__DexterSetResponseHeaders receives params.headers' );
		};
		xhr.__DexterRespond( params );

		assert.strictEqual( spyResponseBody.called, 1, '__DexterSetResponseBody called' );
		assert.strictEqual( spyResponseHeaders.called, 1, '__DexterSetspyResponseHeaders called' );
		assert.strictEqual( xhr.status, 200, 'default status === 200' );
		assert.strictEqual( xhr.statusText, 'OK', 'default statusText === OK' );
		assert.strictEqual( xhr.readyState, 4, 'readyState === 4' );

		assert.throws(function() {
			xhr.__DexterRespond( params );
		}, 'xhr.__DexterRespond can only be called once per xhr object' );

		spyResponseBody.restore();
		spyResponseHeaders.restore();
	});

	QUnit.test( '__DexterRespond alternatives', function( assert ) {
		expect( 7 );

		var xhr = this.xhr,
			params = {
				body: '',
				status: 404
			},
			keepTrue = true;

		xhr.async = false;
		xhr.onreadystatechange = function() {
			keepTrue = false;
		};
		xhr.__DexterRespond( params );

		assert.ok( keepTrue, 'non async xhr won\' trigger readyStateChange' );
		assert.strictEqual( xhr.status, params.status, 'status = params.status' );
		assert.strictEqual( xhr.statusText, 'Not Found', 'statusText is set' );
		assert.deepEqual( xhr.responseHeaders, {}, 'default responseHeaders: {}' );
		assert.strictEqual( xhr.responseText, params.body, 'responseText === params.body' );
		assert.strictEqual( xhr.responseXML, null, 'responseXML not set without Content-Type' );
		assert.strictEqual( xhr.readyState, 4, 'readyState === 4' );
	});

})();
