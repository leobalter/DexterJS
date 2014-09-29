/*
 * Dexter
 * https://github.com/leobalter/DexterJS
 *
 * Copyright (c) 2012 Leonardo Balter
 * Licensed under the MIT, GPL licenses.
 */

(function() {
var Dexter = {
		stored: []
	},
	timerArray = [],
	restore, actions,
	originalTimeout = setTimeout,
	originalInterval = setInterval,
	originalClearTimeout = clearTimeout,
	originalClearInterval = clearInterval;

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

		if ( typeof ( that.callback ) === 'function' ) {
			that.callback.apply( this, args );
		}
		// calls the original method
		return returned;
	},
	'fake': function( that, args ) {
		if ( typeof ( that.callback ) === 'function' ) {
			return that.callback.apply( this, args );
		}
	}
};

function DexterObj( action, obj, method, callback ) {
	var that = this;
	this.called = 0;
	this.isActive = true;

	if ( typeof ( method ) !== 'string' ) {
		throw 'Dexter should receive method name as a String';
	}

	if ( !obj || typeof ( obj[ method ] ) !== 'function' ) {
		throw 'Dexter should receive a valid object and method combination in arguments. Ex.: window & "alert".';
	}

	if ( typeof ( callback ) === 'function' ) {
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

/* Timer */
function Timer() {
	if ( this instanceof Timer ) {
		/* jshint -W020 */
		setTimeout = fakeSetTimeout;
		setInterval = fakeSetInterval;
		clearTimeout = fakeClearTimer;
		clearInterval = fakeClearTimer;
	} else {
		return new Timer();
	}
}

function fakeSetTimeout( callback, timer ) {
	timerArray.push({
		cb: callback,
		time: timer,
		type: 'timeout'
	});
	return timerArray.length;
}

function fakeSetInterval( callback, timer ) {
	timerArray.push({
		cb: callback,
		time: timer,
		type: 'interval',
		originalTime: timer
	});
	return timerArray.length;
}

function fakeClearTimer( timeoutIndex ) {
	timerArray.splice( timeoutIndex - 1, 1 );
}

Timer.prototype = {

	tick: function( n ) {
		var index = 0,
			thisTimer;

		for (; index < timerArray.length; index++ ) {
			thisTimer = timerArray[ index ];

			timerArray[ index ].time = thisTimer.time - n;

			if ( thisTimer.type === 'timeout' ) {
				Timer.prototype.tickTimeout( index );
			}

			if ( thisTimer.type === 'interval' ) {
				Timer.prototype.tickInterval( n, index );
			}
		}

	},

	tickTimeout: function( index ) {
		var thisTimer = timerArray[ index ];

		if ( thisTimer.time <= 0 ) {
			Timer.prototype.executeCallback( index );
			timerArray.splice( index - 1, 1 );
		}
	},

	tickInterval: function( n, index ) {
		var thisTimer = timerArray[ index ],
			howManyTimesWillRun = Math.floor(( n / thisTimer.originalTime )) / 1;

		if ( thisTimer.time <= 0 ) {
			timerArray[ index ].time = ( thisTimer.originalTime - thisTimer.time );
		}

		while ( howManyTimesWillRun ) {
			Timer.prototype.executeCallback( index );
			howManyTimesWillRun--;
		}
	},

	executeCallback: function( index ) {
		var thisTimer = timerArray[ index ];

		if ( typeof thisTimer.cb === 'string' ) {
			/* jshint evil:true */
			eval( thisTimer.cb );
		} else {
			thisTimer.cb();
		}
	},

	restore: function() {
		/* jshint -W020 */
		setTimeout = originalTimeout;
		setInterval = originalInterval;
		clearInterval = originalClearInterval;
		clearTimeout = originalClearTimeout;
		this.resetTimers();
	},

	resetTimers: function() {
		timerArray = [];
	}
};

Dexter.spy = createDexterObj( 'spy' );
Dexter.fake = createDexterObj( 'fake' );
Dexter.restore = restoreAll;
Dexter.timer = Timer;

if ( typeof module !== 'undefined' && module.exports ) {

	// For CommonJS environments, export everything
	module.exports = Dexter;
} else if ( typeof define === 'function' && define.amd ) {

	// amd Enviroments, client and server side
	define( 'dexter', [], function() {
		return Dexter;
	});
} else if ( typeof window !== 'undefined' ) {

	// Old school
	window.Dexter = Dexter;
}

})();
