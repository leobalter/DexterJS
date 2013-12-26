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

    module( 'XHR methods', {
        setup : function() {
            this.myFake = Dexter.fakeXHR();
            this.xhr = getXHR();
        },
        teardown : function() {
            this.myFake.restore();
        }
    });

    test( '.open()', 9, function() {
        var myFake = this.myFake,
                xhr = this.xhr;

        raises( function() {
            xhr.open();
        }, 'xhr.open() [no args] raises error' );

        raises( function() {
            xhr.open( 'GET' );
        }, 'xhr.open( "GET" ) [1 arg] raises error' );

        strictEqual( xhr.readyState, 0, 'readyState starts at 0' );

        xhr.open( 'GET', '/' );

        strictEqual( xhr.readyState, 1, 'readyState == 1 after .open()' );
        strictEqual( xhr.async, true, 'xhr.async defaults to true' );
        strictEqual( xhr.sendFlag, false, 'xhr.sendFlag === false' );

        xhr.open( 'POST', '/', false, 'leo', 'balter' );

        strictEqual( xhr.async, false, 'xhr.async false setting' );
        strictEqual( xhr.username, 'leo' );
        strictEqual( xhr.password, 'balter' );
    });

    test( '.open() => readyStateChange event', 3, function() {
        var xhr = this.xhr;

        xhr.onreadystatechange = function( ev ) {
            ok( true, 'readyStateChange event fired' );
            strictEqual( this, xhr, 'xhr object === this' );
            equal( ev[0].type, 'readystatechange', 'ev.type === readystatechange' );
        };

        xhr.open( 'GET', '/' );
    });

    test( '.abort()', 4, function() {
        var xhr = this.xhr;

        xhr.open( 'GET', '/' );

        xhr.abort();

        strictEqual( xhr.readyState, 0, 'aborted xhr.readyState returns to 0' );
        ok( xhr.aborted, 'xhr.aborted === true' );
        strictEqual( xhr.sendFlag, false, 'xhr.sendFlag === false' );
        ok( xhr.errorFlag, 'xhr.errorFlag === true' );
    });

    test( '.abort() => readyStateChange event', 1, function() {
        var xhr = this.xhr;

        xhr.open( 'GET', '/' );
        xhr.onreadystatechange = function() {
            ok( true, 'readystatechange event fired on .abort()' );
        };

        xhr.abort();
    });

    test( '.setRequestHeader()', 7, function() {
        var xhr = this.xhr;

        raises( function() {
            xhr.setRequestHeader();
        }, 'calling setRequestHeaders without readyState === 1 raises an error' );

        xhr.open( 'GET', '/' );

        xhr.sendFlag = true;
        raises( function() {
            xhr.setRequestHeader();
        }, 'calling setRequestHeaders with xhr.sendFlag == true raises an error' );

        xhr.sendFlag = false;

        raises( function() {
            xhr.setRequestHeader( 'Keep-Alive', '123' );
        }, 'unsafe header raises an error' );

        raises( function() {
            xhr.setRequestHeader( 'Sec-Test', '123' );
        }, 'unsafe header (Sec-) raises an error' );

        raises( function() {
            xhr.setRequestHeader( 'Proxy-Test', '123' );
        }, 'unsafe header (Proxy-) raises an error' );

        xhr.setRequestHeader( 'Dexter', 'JS' );

        deepEqual( xhr.requestHeaders, { 'Dexter' : 'JS' }, 'requestHeader is set' );

        xhr.setRequestHeader( 'Dexter', 'JS' );

        deepEqual( xhr.requestHeaders, { 'Dexter' : 'JS,JS' }, 'requestHeader concatenates the value' );
    });

    test( '.getResponseHeader()', 4, function() {
        var xhr = this.xhr;

        xhr.open( 'GET', '/' );

        xhr.responseHeaders = { 'Dexter': 'JS' };

        equal( xhr.getResponseHeader( 'Dexter' ), null, 'without readyState == 2, getResponseHeader returns null' );

        // 2 == HEADERS_RECEIVED
        xhr.readyState = 2;

        strictEqual( xhr.getResponseHeader( 'Dexter' ), 'JS', 'getResponseHeader returns header value' );

        equal( xhr.getResponseHeader( 'Set-Cookie2' ), null, 'Set-Cookie2 in getResponseHeader returns null' );

        equal( xhr.getResponseHeader( 'Nothing' ), null, 'no header => null return' );
    });

    test( '.send()', 6, function() {
        var xhr = this.xhr;

        xhr.sendFlag = false;
        raises( function() {
            xhr.send( 'a=a' );
        }, 'send() before open raises an error' );

        xhr.open( 'GET', '/' );
        xhr.sendFlag = true;
        raises( function() {
            xhr.send( 'a=b' );
        }, 'send() with xhr.sendFlag = true raises an error' );

        xhr.sendFlag = false;

        xhr.onSend = function() {
            ok( true, '.onSend callback' );
        };

        xhr.onreadystatechange = function() {
            ok( true, '.onreadystatechange callback' );
        };

        xhr.send( 'a=c' );

        equal( xhr.readyState, 1, 'opened readyState' );
        strictEqual( xhr.errorFlag, false, 'falsy errorFlag' );
    });

    test( '.getAllResponseHeaders()', function() {
        var xhr = this.xhr,
                returned;

        xhr.responseHeaders = {
            testA: '1',
            testB: '2',
            testC: '3'
        };

        xhr.readyState = 0;
        returned = xhr.getAllResponseHeaders();
        strictEqual( returned, '', 'with readyState == 0 returns \'\'' );

        xhr.readyState = 1;
        returned = xhr.getAllResponseHeaders();
        strictEqual( returned, '', 'with readyState == 1 returns \'\'' );

        xhr.readyState = 2;
        returned = xhr.getAllResponseHeaders();
        strictEqual( returned, 'testA: 1\r\ntestB: 2\r\ntestC: 3\r\n', 'with readyState == 2 return responseHeaders' );
    });

    test( '.__DexterSetResponseHeaders()', 6, function() {
        var xhr = this.xhr,
                foo = {
                    testA: '1',
                    testB: '2'
                },
                fooCount = 0;

        xhr.async = true;
        xhr.readyState = 0;
        xhr.onreadystatechange = function() {
            ok( true, 'readystatechange callback' );
        };
        xhr.__DexterSetResponseHeaders( foo );

        deepEqual( xhr.responseHeaders, foo, 'xhr.responseHeaders are set' );
        strictEqual( xhr.readyState, 2, 'xhr.readyState === 2' );

        foo.testA = 'AA';
        xhr.async = false;
        xhr.readyState = 0;
        xhr.onreadystatechange = function() {
            ok( false, 'it\'s a trap' );
            fooCount += 1;
        };
        xhr.__DexterSetResponseHeaders( foo );

        deepEqual( xhr.responseHeaders, foo, 'xhr.responseHeaders are re-set' );
        strictEqual( fooCount, 0, 'async false won\'t trigger readystatechange' );
        strictEqual( xhr.readyState, 0, 'xhr.readyState === 0 (async === false)' );
    });

    test( '.__DexterSetResponseBody()', 21, function() {
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
            ok( true, 'readyStateChange triggered. Count == ' + count );
            strictEqual( xhr.readyState, 3, 'xhr.readyState === 3. Count == ' + count );
            strictEqual( xhr.responseText, bar[ count ], 'loading status return text from 10 to 10 chars. "' + bar[ count ] + '"' );
            count++;
        };

        xhr.__DexterSetResponseBody( foo );

        equal( xhr.responseText, foo, 'xhr.responseText is set' );

        foo = '<js>Dexter</js>';
        xhr.responseText = '';
        xhr.responseHeaders = {
            'Content-Type' : 'text/xml'
        };
        xhr.async = false;
        xhr.__DexterSetResponseBody( foo );

        textContent = xhr.responseXML.childNodes[0].textContent || xhr.responseXML.childNodes[0].text; // .text for IE8/IE7 and .textContent for anything else

        strictEqual( xhr.responseXML.childNodes[0].tagName, 'js', 'xml tagName is set' );
        strictEqual( textContent, 'Dexter', 'xml textContent is set' );
    });

    test( '__DexterRespond', 9, function() {
        var xhr = this.xhr,
                params = {
                    body : 'Dexter is a simple Test Helper, framework independent.',
                    headers : { foo: 'bar' }
                },
                // yay! using a spy
                spyResponseBody = Dexter.spy( xhr, '__DexterSetResponseBody' ),
                spyResponseHeaders = Dexter.spy( xhr, '__DexterSetResponseHeaders' );

        xhr.async = true;
        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                ok( true, 'readystatechange / readyState === 4' );
            }
        };
        spyResponseBody.callback = function( spyParam ) {
            strictEqual( spyParam, params.body, 'xhr.__DexterSetResponseBody receives params.body' );
        };
        spyResponseHeaders.callback = function( spyParam ) {
            strictEqual( spyParam, params.headers, 'xhr.__DexterSetResponseHeaders receives params.headers' );
        };
        xhr.__DexterRespond( params );

        strictEqual( spyResponseBody.called, 1, '__DexterSetResponseBody called' );
        strictEqual( spyResponseHeaders.called, 1, '__DexterSetspyResponseHeaders called' );
        strictEqual( xhr.status, 200, 'default status === 200' );
        strictEqual( xhr.statusText, 'OK', 'default statusText === OK' );
        strictEqual( xhr.readyState, 4, 'readyState === 4' );

        raises( function() {
            xhr.__DexterRespond( params );
        }, 'xhr.__DexterRespond can only be called once per xhr object' );

        spyResponseBody.restore();
        spyResponseHeaders.restore();
    });

    test( '__DexterRespond alternatives', 7, function() {
        var xhr = this.xhr,
                params = {
                    body : '',
                    status : 404
                },
                keepTrue = true;

        xhr.async = false;
        xhr.onreadystatechange = function() {
            keepTrue = false;
        };
        xhr.__DexterRespond( params );

        ok( keepTrue, 'non async xhr won\' trigger readyStateChange' );
        strictEqual( xhr.status, params.status, 'status = params.status' );
        strictEqual( xhr.statusText, 'Not Found', 'statusText is set' );
        deepEqual( xhr.responseHeaders, {}, 'default responseHeaders: {}' );
        strictEqual( xhr.responseText, params.body, 'responseText === params.body' );
        strictEqual( xhr.responseXML, null, 'responseXML not set without Content-Type' );
        strictEqual( xhr.readyState, 4, 'readyState === 4' );
    });

}( this ) );
