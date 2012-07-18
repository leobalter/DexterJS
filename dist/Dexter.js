/*! Dexter JS - v0.1.0 - 2012-07-18
* https://github.com/leobalter/DexterJS
* Copyright (c) 2012 Leonardo Balter; Licensed MIT, GPL */

(function(globalObj) {
  var restore, callback, actions;

  restore = function() {
    this._seenObj[ this._seenMethod ] = this._oldCall;
    this.isActive = false;
  };

  function setDexterObjs( obj, method ) {
    this._oldCall = obj[ method ];
    this._seenObj = obj;
    this._seenMethod = method;
  }

  actions = {
    'spy'  : function( that, args ) {
               // calls the original method
               that._oldCall.apply( this, args );
               
             },
    'stub' : function() { /* hummm, nothing */ } 
  };

  function DexterObj( action, obj, method, callback ) {
    var that = this;

    if ( typeof( method ) !== 'string' ) {
      throw 'Dexter should receive method name as a String';
    }

    if ( !obj || typeof( obj[ method ] ) !== 'function' ) {
      throw 'Dexter should receive a valid object and method combination in arguments. Ex.: window & "alert".';
    }

    if ( typeof( callback ) === 'function' ) {
      this.callback = callback;
    }

    setDexterObjs.call( this, obj, method );

    obj[ method ] = function() {
      var args = [].slice.apply( arguments );

      that.called = that.called + 1;
      actions[ action ].call( this, that, args );
      
      if ( typeof( that.callback ) === 'function' ) {
        that.callback.apply( this, args );  
      }
    };
  }

  DexterObj.prototype = {
    called   : 0,
    restore  : restore,
    isActive : true,
    callback : callback
  };

  globalObj.Dexter = {
    spy  : function( obj, method, callback ) {
      return new DexterObj( 'spy', obj, method, callback );
    },
    stub : function( obj, method, callback ) {
      return new DexterObj( 'stub', obj, method, callback );
    }
  };
}(this));