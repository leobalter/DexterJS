/*
 * Dexter
 * https://github.com/leobalter/DexterJS
 *
 * Copyright (c) 2012 Leonardo Balter
 * Licensed under the MIT, GPL licenses.
 */
'use strict';
(function () {
    var Dexter = {
            stored : []
        },
        restore, actions;

    restore = function () {
        this._seenObj[ this._seenMethod ] = this._oldCall;
        this.isActive = false;
    };

    function setDexterObjs( scope, obj, method ) {
        scope._oldCall = obj[ method ];
        scope._seenObj = obj;
        scope._seenMethod = method;
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
        'fake' : function( that, args ) {
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

        obj[ method ] = function () {
            var args = [].slice.apply( arguments );

            that.called = that.called + 1;

            return actions[ action ].call( this, that, args );
        };
    }

    function createDexterObj( name ) {
        return function ( obj, method, callback ) {
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
        restore  : restore
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

}());
