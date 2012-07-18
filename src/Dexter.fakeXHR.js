/*globals ActiveXObject:true,Dexter:true,document:true*/
(function( globalObj, Dexter, undefined ) {
  /* var declarations */
  var ajaxObjs = {},
      statusCodes,
      unsafeHeaders,
      fakeXHRObj,
      CreateFakeXHR;

  /*** 
   * checks for XHR existence
   * returns => XHR fn || false
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

  /***
   * checks for ActiveXObject XHR existence 
   * returns => ActiveX XHR fn || false
   ***/ 
  ajaxObjs.actX = (function() {
    var xhr;
    try {
      xhr = new ActiveXObject( 'Microsoft.XMLHTTP' );
      return ActiveXObject;
    } catch( e ) {
      return false;
    }
  }());
  
  // Status code and their respective texts
  statusCodes = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choice",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
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
    UNSENT                  : 0,
    OPENED                  : 1,
    HEADERS_RECEIVED        : 2,
    LOADING                 : 3,
    DONE                    : 4,
    // event handlers
    onabort                 : null,
    onerror                 : null,
    onload                  : null,
    onloadend               : null,
    onloadstart             : null,
    onprogress              : null,
    onreadystatechange      : null,
    ontimeout               : null,
    // readyState always start by 0
    readyState              : 0,
    // other properties
    response                : "",
    responseText            : "",
    responseType            : "",
    responseXML             : null,
    withCredentials         : false,
    // status code
    status                  : 0,
    // status text relative to the status code
    statusText              : "",
    // timeout to be set, starts by 0
    timeout                 : 0,
    /***
     * fake .abort
     ***/
    abort                   : function() {
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
    getResponseHeader      : function( key ) {
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
    open                    : function( method, url, async, username, password ) {
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
    send                    : function( data ) {
      // readyState verification (xhr should be already opened)
      verifyState( this.readyState, this.sendFlag );

      // setting properties
      this.errorFlag = false;
      this.sendFlag = this.async;

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
    setRequestHeader        : function( key, value ) {
      // readyState verification (xhr should be already opened)
      verifyState( this.readyState, this.sendFlag );

      // key shouldn´t be one of the unsafeHeaders neither start with Sec- or
      // Proxy-

      if ( ( unsafeHeaders.indexOf( key ) >= 0 ) || /^(Sec-|Proxy-)/.test( key ) ) {
        throw new Error( 'Refused to set unsafe header "' + key + '"' );
      }

      if ( this.requestHeaders[ key ] ) {
        // if we already have this key set, we concatenate values
        this.requestHeaders[ key ] += "," + value;
      } else {
        // or we just set key and value
        this.requestHeaders[ key ] = value;
      }
    },
    /***
     * fake getAllResponseHeaders
     ***/
    getAllResponseHeaders   : function() {
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
    __DexterXHR             : true,
    /***
     * __DexterStateChange handles events on readyState changes
     ***/
    __DexterStateChange     : function( state ) {
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
            type : 'readystatechange'
          };
        }

        // the event goes inside an Array
        this.onreadystatechange.call( this, [ ev ] );
      }
    },
    /***
     * __DexterSetResponseBody builds the response text.
     ***/
    __DexterSetResponseBody   : function( body ) {
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
    __DexterRespond         : function( params ) {
      var error = false,
          body = params.body || '',
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
     * upload                  : function() {},
     * getInterface            : function() {},
     * overrideMimeType        : function() {},
     * sendAsBinary            : function() {}
     ***/
  };

  /***
   * CreateFakeXHR builds the fakeXHR object
   * this is a constructor and should be called with 'new'
   ***/
  CreateFakeXHR = function() {
    var DexterXHR = this,
        FakeRequest,
        FakeXMLHttpRequest,
        FakeActiveXObject;

    /***
     * requests will contain all requests made on the fakeXHR object´s lifecycle
     * doing so, they can be monitored via Dexter.fakeXHR´s instance
     ***/
    this.requests = [];
    this.doneRequests = [];

    /***
     * this is the fake request function, and this will be applied to 
     * XMLHttpRequest and/or ActiveXObject regarding their availability
     ***/
    FakeRequest = function( argsObj, type ) {
      var args = [].slice.call( argsObj );
      
      // creating a reference of xhr object in Dexter.fakeXHR() object
      DexterXHR.requests.push( this );

      // we set a timeStamp on __DexterRef to identify requests
      this.__DexterRef = Date.now();

      // we need an ActiveXObject fallback if an external
      // script is trying request any other funcionality
      if ( type === 'ActiveXObject' && args[0] !== 'Microsoft.XMLHTTP' ) {
          return ajaxObjs( args );
      } else {
          return this;
      }
    };

    // I can sacrifice these 2 to improve in performance,
    // how dumb can be the ActiveXObject detection?
    // I'm not feeling I'll need this.
    FakeXMLHttpRequest = function() {
      FakeRequest.call( this, arguments, 'XMLHttpRequest' );
    };

    FakeActiveXObject = function() {
      FakeRequest.call( this, arguments, 'ActiveXObject' );
    };

    // we import the fake XHR prototype to both methods
    FakeXMLHttpRequest.prototype = fakeXHRObj;
    FakeActiveXObject.prototype = fakeXHRObj;

    if ( ajaxObjs.xhr ) {
        globalObj.XMLHttpRequest = FakeXMLHttpRequest;
    }

    if ( ajaxObjs.actX ) {
        globalObj.ActiveXObject = FakeActiveXObject;
    }
  };

  /***
   * this is the Dexter.fakeXHR prototype, those method will be seen directly on
   * its returned object. Not on the XHR itself.
   ***/
  CreateFakeXHR.prototype = {
    // TODO: test
    /***
     * interface to export xhr.__DexterRespond and set this.doneRequests
     ***/
    respond : function( params, index ) {
      var xhr;

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
     * restore the XHR objects to their original states, defaking them
     * this won´t affect already created fake ajax requests.
     ***/
    restore : function() {
        if ( ajaxObjs.xhr ) {
            globalObj.XMLHttpRequest = ajaxObjs.xhr;
        }

        if ( ajaxObjs.actX ) {
            globalObj.ActiveXObject = ajaxObjs.actX;
        }
    }
  };

  /***
   * this exports the fakeXHR method to Dexter.
   ***/
  Dexter.fakeXHR = function fakeXHR() {
    return new CreateFakeXHR();   
  };

}( this, Dexter ));