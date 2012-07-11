/*! Dexter JS - v0.1.0 - 2012-07-11
* https://github.com/leobalter/DexterJS
* Copyright (c) 2012 Leonardo Balter; Licensed MIT, GPL */

(function(globalObj) {
  function dexter() {
    var restore, callback, fnPrototype, actions;

    restore = function() {
      this._seenObj[ this._seenMethod ] = this._oldCall;
      this.isActive = false;
    };

    callback = function() {};

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
                 that._oldCall.apply( this, args );
               },
      'stub' : function stub( that, args ) {
                 that.callback.apply( this, args );
               } 
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