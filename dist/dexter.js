/*! DexterJS - v0.5.1 - 2014-02-26
 * https://github.com/leobalter/DexterJS
 * Copyright (c) 2014 Leonardo Balter; Licensed MIT, GPL */
(function() {
    'use strict';

    var Dexter = {
            stored: []
        },
        restore, actions;

    restore = function() {
        this._seenObj[ this._seenMethod ] = this._oldCall;
        this.isActive = false;
    };

    function setDexterObjs( scope, obj, method ) {
        scope._oldCall = obj[ method ];
        scope._seenObj = obj;
        scope._seenMethod = method;
    }

    actions = {
        'spy': function( that, args ) {
            // call order issues
            var returned = that._oldCall.apply( this, args );

            if ( typeof( that.callback ) === 'function' ) {
                that.callback.apply( this, args );
            }
            // calls the original method
            return returned;
        },
        'fake': function( that, args ) {
            if ( typeof( that.callback ) === 'function' ) {
                return that.callback.apply( this, args );
            }
        }
    };

    function DexterObj( action, obj, method, callback ) {
        var that = this;
        this.called = 0;
        this.isActive = true;

        if ( typeof( method ) !== 'string' ) {
            throw 'Dexter should receive method name as a String';
        }

        if ( !obj || typeof( obj[ method ] ) !== 'function' ) {
            throw 'Dexter should receive a valid object and method combination in arguments. Ex.: window & "alert".';
        }

        if ( typeof( callback ) === 'function' ) {
            this.callback = callback;
        }

        setDexterObjs( this, obj, method );

        obj[ method ] = function() {
            var args = [].slice.apply( arguments );

            that.called = that.called + 1;

            return actions[ action ].call( this, that, args );
        };
    }

    function createDexterObj( name ) {
        return function( obj, method, callback ) {
            var newObj = new DexterObj( name, obj, method, callback );
            Dexter.stored.push( newObj );

            return newObj;
        };
    }

    function restoreAll() {
        while ( Dexter.stored.length ) {
            Dexter.stored.pop().restore();
        }

        return Dexter.stored.length === 0;
    }

    DexterObj.prototype = {
        restore: restore
    };

    Dexter.spy = createDexterObj( 'spy' );
    Dexter.fake = createDexterObj( 'fake' );
    Dexter.restore = restoreAll;

    // referencing to the global scope
    if ( typeof module === 'undefined' || typeof module.exports === 'undefined' ) {
        window.Dexter = Dexter;
    } else {
        // for CommonJS environments, export everything
        module.exports = Dexter;
    }

    // amd Enviroments, client and server side
    if ( typeof define === 'function' && define.amd ) {
        define( 'dexter', [], function() {
            return Dexter;
        });
    }

}());

(function() {
    var Dexter, globalObj,
        statusCodes, unsafeHeaders, fakeXHRObj, CreateFakeXHR,
        ajaxObjs = {};

    /***
     * checks for XHR existence
     * returns => XHR fn name || false
     ***/
    ajaxObjs.xhr = (function() {
        var xhr;
        try {
            xhr = new XMLHttpRequest();
            return XMLHttpRequest;
        } catch( e ) {
            return false;
        }
    }());

    if ( ajaxObjs.xhr ) {
        Dexter = window.Dexter;
        globalObj = window;
    } else {
        // no need to setup fakeXHR for node environment
        module.exports = function() { return {}; };
        return false;
    }

    /***
     * this exports the fakeXHR method to Dexter.
     ***/
    Dexter.fakeXHR = function() {
        return new CreateFakeXHR();
    };

    // Status code and their respective texts
    statusCodes = {
        100: 'Continue',
        101: 'Switching Protocols',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choice',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        422: 'Unprocessable Entity',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };

    // Some headers should be avoided
    unsafeHeaders = [
        'Accept-Charset',
        'Accept-Encoding',
        'Connection',
        'Content-Length',
        'Cookie',
        'Cookie2',
        'Content-Transfer-Encoding',
        'Date',
        'Expect',
        'Host',
        'Keep-Alive',
        'Referer',
        'TE',
        'Trailer',
        'Transfer-Encoding',
        'Upgrade',
        'User-Agent',
        'Via'
    ];

    // IE7
    if ( typeof( Array.prototype.indexOf ) === 'undefined' ) {
        unsafeHeaders.indexOf = function( key, start ) {
            var i = ( start || 0 ),
                    length = this.length;

            for ( ; i < length ; i++ ) {
                if ( this[ i ] === key ) {
                    return i;
                }
            }
            return -1;
        };
    }

    /***
     * verifyState helps verifying XHR readyState in cases when that should be
     * 1 (Opened) and sendFlag can´t be true. (not yet sent request)
     ***/
    function verifyState( state, sendFlag ) {
        if ( state !== 1 || sendFlag ) {
            throw new Error( 'INVALID_STATE_ERR' );
        }
    }

    /***
     * string to XML parser. Got this from SinonJS that got the same from JSpec
     ***/
    function parseXML( text ) {
        var xmlDoc,
                parser;

        if ( typeof globalObj.DOMParser !== 'undefined' ) {
            parser = new globalObj.DOMParser();
            xmlDoc = parser.parseFromString( text, 'text/xml' );
        } else {
            xmlDoc = new ActiveXObject( 'Microsoft.XMLDOM' );
            xmlDoc.async = 'false';
            xmlDoc.loadXML( text );
        }

        return xmlDoc;
    }

    fakeXHRObj = {
        // Status constants
        UNSENT:                   0,
        OPENED:                   1,
        HEADERS_RECEIVED:         2,
        LOADING:                  3,
        DONE:                     4,
        // event handlers
        onabort:                  null,
        onerror:                  null,
        onload:                   null,
        onloadend:                null,
        onloadstart:              null,
        onprogress:               null,
        onreadystatechange:       null,
        ontimeout:                null,
        // readyState always start by 0
        readyState:               0,
        // other properties
        response:                 '',
        responseText:             '',
        responseType:             '',
        responseXML:              null,
        withCredentials:          false,
        // status code
        status:                   0,
        // status text relative to the status code
        statusText:               '',
        // timeout to be set, starts by 0
        timeout:                  0,
        /***
         * fake .abort
         ***/
        abort:                    function() {
            // reseting properties
            this.aborted = true;
            this.errorFlag = true;
            this.method = null;
            this.url = null;
            this.async = undefined;
            this.username = null;
            this.password = null;
            this.responseText = null;
            this.responseXML = null;
            this.requestHeaders = {};
            this.sendFlag = false;
            // triggering readystatechange
            if ( this.readyState > this.UNSENT && this.sendFlag ) {
                this.__DexterStateChange( this.DONE );
            } else {
                this.__DexterStateChange( this.UNSENT );
            }

        },
        /***
         * fake .getResponseHeader
         ***/
        getResponseHeader:       function( key ) {
            var headerName,
                    responseHeaders = this.responseHeaders;
            // no return before receiving headers
            if ( this.readyState < this.HEADERS_RECEIVED ) {
                return null;
            }

            // no return for Set-Cookie2
            if ( /^Set-Cookie2?$/i.test( key ) ) {
                return null;
            }

            // we manage key finding to different letter cases
            key = key.toLowerCase();

            for ( headerName in responseHeaders ) {
                if ( responseHeaders.hasOwnProperty( headerName ) ) {
                    // do we have that key?
                    if ( headerName.toLowerCase() === key ) {
                        // se we return its value
                        return responseHeaders[ headerName ];
                    }
                }
            }

            // no success, return null
            return null;
        },
        /***
         * fake .open
         ***/
        open:                     function( method, url, async, username, password ) {
            // method and url aren´t optional
            if ( typeof( method ) === 'undefined' || typeof( url ) === 'undefined' ) {
                throw new Error( 'Not enough arguments' );
            }
            // setting properties
            this.method = method;
            this.url = url;

            // async default is true, so if async is undefined it is set to true,
            // otherwise async get its boolean value
            this.async = ( typeof( async ) === 'undefined' ? true : !!async );

            this.username = username;
            this.password = password;
            // cleaning these properties
            this.responseText = null;
            this.responseXML = null;
            this.requestHeaders = {};
            this.sendFlag = false;

            // triggering readystatechange with Opened status
            this.__DexterStateChange( this.OPENED );
        },
        /***
         * fake .send
         ***/
        send:                     function( data ) {
            var reqHeaders;
            // readyState verification (xhr should be already opened)
            verifyState( this.readyState, this.sendFlag );

            if ( !/^(get|head)$/i.test( this.method ) ) {
                if (this.requestHeaders[ 'Content-Type' ]) {
                    reqHeaders = this.requestHeaders[ 'Content-Type' ].split( ';' );
                    this.requestHeaders[ 'Content-Type' ] = reqHeaders[ 0 ] + ';charset=utf-8';
                } else {
                    this.requestHeaders[ 'Content-Type' ] = 'text/plain;charset=utf-8';
                }
                this.requestBody = data;
            }

            // setting properties
            this.errorFlag = false;
            this.sendFlag = true; // this.async;

            // trigger readystatechange with Opened status
            this.__DexterStateChange( this.OPENED );

            // hummm if think I won´t need this, omg, where´s the specification
            if ( typeof( this.onSend ) === 'function' ) {
                this.onSend( this );
            }
        },
        /***
         * fake .setRequestHeader
         ***/
        setRequestHeader:         function( key, value ) {
            // readyState verification (xhr should be already opened)
            verifyState( this.readyState, this.sendFlag );

            // key shouldn´t be one of the unsafeHeaders neither start with Sec- or
            // Proxy-

            if ( ( unsafeHeaders.indexOf( key ) >= 0 ) || /^(Sec-|Proxy-)/.test( key ) ) {
                throw new Error( 'Refused to set unsafe header "' + key + '"' );
            }

            if ( this.requestHeaders[ key ] ) {
                // if we already have this key set, we concatenate values
                this.requestHeaders[ key ] += ',' + value;
            } else {
                // or we just set key and value
                this.requestHeaders[ key ] = value;
            }
        },
        /***
         * fake getAllResponseHeaders
         ***/
        getAllResponseHeaders:    function() {
            var headers = '',
                    header;

            if ( this.readyState < this.HEADERS_RECEIVED ) {
                return '';
            }

            for ( header in this.responseHeaders ) {
                if ( this.responseHeaders.hasOwnProperty( header ) && !/^Set-Cookie2?$/i.test( header ) ) {
                    headers += header + ': ' + this.responseHeaders[ header ] + '\r\n';
                }
            }

            return headers;
        },
        /***
         * __DexterSetResponseHeaders set xhr response headers to make arrangements
         * before completing the fake ajax request
         ***/
        __DexterSetResponseHeaders: function( headers ) {
            var header;
            // reseting response headers
            this.responseHeaders = {};

            for ( header in headers ) {
                if ( headers.hasOwnProperty( header ) ) {
                    this.responseHeaders[ header ] = headers[ header ];
                }
            }

            // async requests should trigger readystatechange event
            if ( this.async ) {
                this.__DexterStateChange( this.HEADERS_RECEIVED );
            }
        },
        /***
         * __DexterXHR indicates this is a Dexter faked XHR
         ***/
        __DexterXHR:              true,
        /***
         * __DexterStateChange handles events on readyState changes
         ***/
        __DexterStateChange:      function( state ) {
            var ev;
            this.readyState = state;

            if ( typeof this.onreadystatechange === 'function' ) {
                try {
                    // dumb event creation. "new Event" just fire errors in webkit engines
                    ev = document.createEvent( 'Event' );
                    ev.initEvent( 'readystatechange', false, false );
                } catch (e) {
                    // dammit, IE7!
                    // TODO: this would break anyone´s code?
                    ev = {
                        type: 'readystatechange'
                    };
                }

                // the event goes inside an Array
                this.onreadystatechange.call( this, [ ev ] );
            }
        },
        /***
         * __DexterSetResponseBody builds the response text.
         ***/
        __DexterSetResponseBody:    function( body ) {
            var chunkSize = this.chunkSize || 10,
                    index = 0,
                    type;

            this.responseText = '';

            if ( this.async ) {
                while ( index <= body.length ) {
                    this.__DexterStateChange( this.LOADING );
                    this.responseText += body.substring( index, ( index += chunkSize ) );
                }
            } else {
                this.responseText = body;
            }

            type = this.getResponseHeader( 'Content-Type' ) || '';

            if ( body && ( /(text\/xml)|(application\/xml)|(\+xml)/.test( type ) ) ) {
                try {
                    this.responseXML = parseXML( body );
                } catch ( e ) {
                    // Unable to parse XML
                }
            }
        },
        /***
         * __DexterRespond is the call to complete a ajax request
         * @params {
         *   body : string with responseText (Default: '')
         *   headers : responseHeaders (Default: {})
         *   status : Number status code (Default: 200)
         * }
         ***/
        __DexterRespond:          function( params ) {
            var body = params.body || '',
                    headers = params.headers || {},
                    DONE = this.DONE;

            // this should be verified to prevent recalling method
            if ( this.readyState === DONE ) {
                throw new Error( 'Request already done' );
            }

            this.__DexterSetResponseHeaders( headers );
            this.status = params.status || 200;
            this.statusText = statusCodes[ this.status ];

            this.__DexterSetResponseBody( body );

            // triggers the readystatechange if is an async request
            if ( this.async ) {
                this.__DexterStateChange( DONE );
            } else {
                // not being async, just set readyState value
                this.readyState = DONE;
            }
        }
        /***
         * not implemented yet XHR functions
         * upload:                   function() {},
         * getInterface:             function() {},
         * overrideMimeType:         function() {},
         * sendAsBinary:             function() {}
         ***/
    };

    /***
     * CreateFakeXHR builds the fakeXHR object
     * this is a constructor and should be called with 'new'
     ***/
    CreateFakeXHR = function() {
        var FakeRequest, fakeObj,
            DexterXHR = this;

        /***
         * requests will contain all requests made on the fakeXHR object´s lifecycle
         * doing so, they can be monitored via Dexter.fakeXHR´s instance
         ***/
        this.requests = [];
        this.doneRequests = [];

        /***
         * this is the fake request function to be applied to XMLHttpRequest
         ***/
        FakeRequest = function() {
            // creating a reference of xhr object in Dexter.fakeXHR() object
            DexterXHR.requests.push( this );

            // we set a timeStamp on __DexterRef to identify requests
            this.__DexterRef = Date.now();

            return this;
        };

        fakeObj = function() {
            FakeRequest.call( this );
        };

        // we import the fake XHR prototype to both methods
        fakeObj.prototype = fakeXHRObj;

        globalObj.XMLHttpRequest = fakeObj;
    };

    /***
     * this is the Dexter.fakeXHR prototype, those method will be seen directly on
     * its returned object. Not on the XHR itself.
     ***/
    CreateFakeXHR.prototype = {
        /***
         * interface to export xhr.__DexterRespond and set this.doneRequests
         ***/
        respond: function( params, index ) {
            var xhr;

            params = params || {};
            if ( index ) {
                // if index number is set return that indexed element
                xhr = this.requests.splice( index, 1 )[0];
            } else {
                // else it gets the first request in line
                xhr = this.requests.shift();
            }

            xhr.__DexterRespond( params );

            // selected xhr will be seen on doneRequests collection
            this.doneRequests.push( xhr );
        },
        /***
         * uses a Dexter.spy on xhr send requests
         ***/
        spy: function( callback ) {
            var spy = Dexter.spy( fakeXHRObj, 'send', callback );
            // this.__spy will be used on .restore();
            this.__spy = spy;
            return spy;
        },
        /***
         * restore the XHR objects to their original states, defaking them
         * this won´t affect already created fake ajax requests.
         ***/
        restore: function() {
            if ( this.__spy ) {
                this.__spy.restore();
            }
            globalObj.XMLHttpRequest = ajaxObjs.xhr;
        }
    };

}());
