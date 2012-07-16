/*globals ActiveXObject:true,Dexter:true*/
(function( globalObj, Dexter ) {
  /* var declarations */
  var ajaxObjs = {},
      statusCodes,
      readyStates,
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

  readyStates = {
    UNSENT           : 0,
    OPENED           : 1,
    HEADERS_RECEIVED : 2,
    LOADING          : 3,
    DONE             : 4
  };

  fakeXHRObj = {
    __DexterXHR             : true,
    onabort                 : null,
    onerror                 : null,
    onload                  : null,
    onloadend               : null,
    onloadstart             : null,
    onprogress              : null,
    onreadystatechange      : null,
    ontimeout               : null,
    readyState              : readyStates.UNSENT,
    response                : "",
    responseText            : "",
    responseType            : "",
    responseXML             : null,
    status                  : 0,
    statusText              : "",
    timeout                 : 0,
    upload                  : function() {},
    withCredentials         : false,
    abort                   : function() {},
    getAllResponseHeaders   : function() {},
    getInterface            : function() {},
    open                    : function() {},
    overrideMimeType        : function() {},
    send                    : function() {},
    sendAsBinary            : function() {},
    setRequestHeader        : function() {}
  };

  CreateFakeXHR = function() {
    var DexterXHR = this,
        FakeXMLHttpRequest,
        FakeActiveXObject;

    FakeXMLHttpRequest = function() {
      var args = [].slice.call( arguments ),
          xhrCall = {
              type  : 'XMLHttpRequest'
          };
      // DexterXHR.requests.push( xhrCall );
      [].push.call( DexterXHR, xhrCall );

      return this;
    };

    FakeActiveXObject = function() {
      var args = [].slice.call( arguments ),
          xhrCall = {
              type  : 'ActiveXObject'
          };
      // DexterXHR.requests.push( xhrCall );
      [].push.call( DexterXHR, xhrCall );

      if ( args[0] !== 'Microsoft.XMLHTTP' ) {
          return ajaxObjs( args );
      } else {
          return this;
      }
    };

    FakeXMLHttpRequest.prototype = fakeXHRObj;
    FakeActiveXObject.prototype = fakeXHRObj;

    if ( ajaxObjs.xhr ) {
        globalObj.XMLHttpRequest = FakeXMLHttpRequest;
    }

    if ( ajaxObjs.actX ) {
        globalObj.ActiveXObject = FakeActiveXObject;
    }
  };

  CreateFakeXHR.prototype = {
    respond : function( status, data ) {
        /* not yet */
    },
    restore : function() {
        if ( ajaxObjs.xhr ) {
            globalObj.XMLHttpRequest = ajaxObjs.xhr;
        }

        if ( ajaxObjs.actX ) {
            globalObj.ActiveXObject = ajaxObjs.actX;
        }
    }
  };

  Dexter.fakeXHR = function fakeXHR() {
    return new CreateFakeXHR();
  };

}(this, Dexter));