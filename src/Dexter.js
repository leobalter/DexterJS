/*
 * Dexter
 * https://github.com/leobalter/DexterJS
 *
 * Copyright (c) 2012 Leonardo Balter
 * Licensed under the MIT, GPL licenses.
 */
(function( globalObj ) {
    var restore, actions;

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
        'spy' : function( that, args ) {
                    // call order issues
                    var returned = that._oldCall.apply( this, args );

                    if ( typeof( that.callback ) === 'function' ) {
                        that.callback.apply( this, args );
                    }
                    // calls the original method
                    return returned;
                },
        'stub' : function( that, args ) { 
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

        setDexterObjs.call( this, obj, method );

        obj[ method ] = function() {
            var args = [].slice.apply( arguments );

            that.called = that.called + 1;

            return actions[ action ].call( this, that, args );
        };
    }

    DexterObj.prototype = {
        restore  : restore
    };

    globalObj.Dexter = {
        spy  : function( obj, method, callback ) {
            return new DexterObj( 'spy', obj, method, callback );
        },
        stub : function( obj, method, callback ) {
            return new DexterObj( 'stub', obj, method, callback );
        }
    };
}( this ));
