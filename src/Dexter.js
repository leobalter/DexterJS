/*
 * Dexter
 * https://github.com/leobalter/Dexter
 *
 * Copyright (c) 2012 Leonardo Balter
 * Licensed under the MIT, GPL licenses.
 */

(function(globalObj) {
  function dexter() {
    var restore, callback, fnPrototype, actions;

    restore = function() {
      this._seenObj[ this._seenMethod ] = this._oldCall;
      this.isActive = false;
    };

    fnPrototype = {
      called   : 0,
      restore  : restore,
      isActive : true,
      callback : callback
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

    function CreateObj( action, obj, method, callback ) {
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

    CreateObj.prototype = fnPrototype;

    function newSpy( obj, method ) {
      return new CreateObj( 'spy', obj, method );
    }

    function newStub( obj, method, callback ) {
      return new CreateObj( 'stub', obj, method, callback );
    }

    return {
      spy  : newSpy,
      stub : newStub
    };
  }
  globalObj.Dexter = dexter();
}(this));