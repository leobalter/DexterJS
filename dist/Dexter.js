/*! Dexter JS - v0.1.0 - 2012-07-11
* https://github.com/leobalter/Dexter
* Copyright (c) 2012 Leonardo Balter; Licensed MIT, GPL */

(function(globalObj) {
  function dexter() {
    var restore, toReturn, fnPrototype, actions;

    restore = function() {
      this._seenObj[ this._seenMethod ] = this._oldCall;
      this.isActive = false;
    };

    toReturn = function() {};

    fnPrototype = {
      called   : 0,
      restore  : restore,
      isActive : true,
      toReturn : toReturn
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
                 that.toReturn.apply( this, args );
               } 
    };

    function CreateObj( action, obj, method, toReturn ) {
      var that = this;

      if ( typeof( method ) !== 'string' ) {
        throw 'Dexter should receive method name as a String';
      }

      if ( !obj || typeof( obj[ method ] ) !== 'function' ) {
        throw 'Dexter should receive a valid object and method combination in arguments. Ex.: window & "alert".';
      }

      if ( typeof( toReturn ) === 'function' ) {
        this.toReturn = toReturn;
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

    function newStub( obj, method, toReturn ) {
      return new CreateObj( 'stub', obj, method, toReturn );
    }

    return {
      spy  : newSpy,
      stub : newStub
    };
  }
  globalObj.Dexter = dexter();
}(this));