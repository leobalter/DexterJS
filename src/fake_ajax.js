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

  /***
   * verifyState helps verifying XHR readyState in cases when that should be 
   * 1 (Opened) and sendFlag can´t be true. (not yet sent request)
   ***/
  function verifyState( state, sendFlag ) {
    if ( state !== 1 || sendFlag ) {
        throw new Error( 'INVALID_STATE_ERR' );
    }
  }

  fakeXHRObj = {
    UNSENT                  : 0,
    OPENED                  : 1,
    HEADERS_RECEIVED        : 2,
    LOADING                 : 3,
    DONE                    : 4,
    onabort                 : null,
    onerror                 : null,
    onload                  : null,
    onloadend               : null,
    onloadstart             : null,
    onprogress              : null,
    onreadystatechange      : null,
    ontimeout               : null,
    readyState              : 0,
    response                : "",
    responseText            : "",
    responseType            : "",
    responseXML             : null,
    status                  : 0,
    statusText              : "",
    timeout                 : 0,
    withCredentials         : false,
    /***
     * fake .abort
     ***/
    abort                   : function() {
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
      if ( this.readyState < this.HEADERS_RECEIVED ) {
        return null;
      }

      if ( /^Set-Cookie2?$/i.test( key ) ) {
        return null;
      }

      key = key.toLowerCase();

      for ( headerName in responseHeaders ) {
        if ( responseHeaders.hasOwnProperty( headerName ) ) {
          if ( headerName.toLowerCase() === key ) {
            return responseHeaders[ headerName ];
          }  
        }
      }

      return null;
    },
    /***
     * fake .open
     ***/
    open                    : function( method, url, async, username, password ) {
      if ( typeof( method ) === 'undefined' || typeof( url ) === 'undefined' ) {
        throw new Error( 'Not enough arguments' );
      }
      this.method = method;
      this.url = url;

      // async default is true, so if async is undefined it is set to true,
      // otherwise async get its boolean value
      this.async = ( typeof( async ) === 'undefined' ? true : !!async );

      this.username = username;
      this.password = password;
      this.responseText = null;
      this.responseXML = null;
      this.requestHeaders = {};
      this.sendFlag = false;
      this.__DexterStateChange( this.OPENED );
    },
    /***
     * fake .send 
     ***/
    send                    : function( data ) {
      verifyState( this.readyState, this.sendFlag );

      this.errorFlag = false;
      this.sendFlag = this.async;
      this.__DexterStateChange( this.OPENED );

      if ( typeof( this.onSend ) === 'function' ) {
          this.onSend( this );
      }
    },
    /***
     * fake .setRequestHeader 
     ***/
    setRequestHeader        : function( key, value ) {
      verifyState( this.readyState, this.sendFlag );

      if ( ( unsafeHeaders.indexOf( key ) >= 0 ) || /^(Sec-|Proxy-)/.test( key ) ) {
        throw new Error( 'Refused to set unsafe header "' + key + '"' );
      }

      if ( this.requestHeaders[ key ] ) {
        this.requestHeaders[ key ] += "," + value;
      } else {
        this.requestHeaders[ key ] = value;
      }
    },
    /***
     * __DexterSetResponseHeaders set xhr response headers to make arrangements
     * before completing the fake ajax request
     ***/
    // TODO: test
    __DexterSetResponseHeaders: function __DexterSetResponseHeaders( headers ) {
      var header;

      this.responseHeaders = {};

      for ( header in headers ) {
        if ( headers.hasOwnProperty( header ) ) {
          this.responseHeaders[ header ] = headers[ header ];
        }
      }

      if ( this.async ) {
        this.readyStateChange( this.HEADERS_RECEIVED );
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
        ev = document.createEvent( 'Event' );
        ev.initEvent( 'readystatechange', false, false );

        // the event goes inside an Array
        this.onreadystatechange.call( this, [ ev ] );
      }
    },
    /***
     * not implemented yet XHR functions
     ***/
    upload                  : function() {},
    getAllResponseHeaders   : function() {},
    getInterface            : function() {},
    overrideMimeType        : function() {},
    sendAsBinary            : function() {}
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
    // TODO: implementation and test
    respond : function( status, data ) {
        /* not yet */
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
    },
    /***
     * requests will contain all requests made on the fakeXHR object´s lifecycle
     * doing so, they can be monitored via Dexter.fakeXHR´s instance
     ***/
    requests : []
  };

  /***
   * this exports the fakeXHR method to Dexter.
   ***/
  Dexter.fakeXHR = function fakeXHR() {
    return new CreateFakeXHR();
  };

}(this, Dexter));