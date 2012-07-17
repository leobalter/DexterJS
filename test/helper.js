/*globals foo:true, getXHR:true, ActiveXObject:true */

window.foo = {};

function getXHR() {
	try {
		return new XMLHttpRequest();
	} catch ( e ) { }

	try {
		return new ActiveXObject( 'Microsoft.XMLHTTP' );
	} catch ( e ) { }
}