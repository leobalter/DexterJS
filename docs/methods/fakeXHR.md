## Dexter.fakeXHR()

Dexter also fakes Ajax methods, this is great to speed up your tests and avoid server requisites. Using `Dexter.fakeXHR` you won't need to set a server. fakeXHR is just a disguise method, and you can restore XHR methods at any time.

Dexter.fakeXHR methods were based on `Sinon.JS`. Similar calls are not mere coincidence.

Supposing we have a `ajax()` function that sets an Ajax request, we need to test it without really opening a request and avoid server's latency:

```javascript
function ajax( method, url, data, callback ) {
    var xhr;

    // Remember this is an dumb example and you can do 
    // better to make ajax requests or use great libraries
    // to abstract this in a good design pattern.
    try {
        xhr = new XMLHttpRequest();
    } catch ( e ) {
        try {
            xhr = new ActiveXObject( 'Microsoft.XMLHTTP' );
        } catch ( e ) { 
            /* no country for old browsers */
        }
    }

    xhr.onreadystatechange = function() {
        if ( this.readyState === 4 ) {
            callback();
        }
    };

    xhr.open( method, url, true );

    xhr.send( data );

    return xhr;
}
```

Now we're going to test this:

```javascript
test( 'ajax()', 2, function() {
    // this is where we fake XHR calls
    var fakeXHR = Dexter.fakeXHR(),
        xhr = ajax( 'GET', '/ajax.php', { foo : 'bar' }, function() {
            ok( true, 'ajax completed' );
        });

    // opening an fake ajax request will register its object to the fakeXHR instance:
    strictEqual( fakeXHR.requests[0], xhr, 'fakeXHR.requests[0] === xhr' );

    // And now we can respond the fake Ajax call:
    fakeXHR.respond({
        body : 'this is the ajax returned text',
        // optional setting response header
        headers : { foo2 : 'bar2' },
        // the status code (200 is default)
        status : 200
    });

    // after completing a request, you can notice the xhr object 
    // have been moved to fakeXHR.doneRequests collection
});
```

You can also handle multiple Ajax requests:

```javascript
test( 'ajax()', 2, function() {
    // this is where we fake XHR calls
    var fakeXHR = Dexter.fakeXHR(),
        xhr1 = ajax( 'GET', '/ajax1.php', {}, function() {
            ok( true, 'ajax 1 completed' );
        }),
        xhr2 = ajax( 'GET', '/ajax2.php', {}, function() {
            ok( true, 'ajax 2 completed' );
        }),
        xhr3 = ajax( 'GET', '/ajax3.php', {}, function() {
            ok( true, 'ajax 3 completed' );
        }),
        index = 2;

    // now fakeXHR.requests.length is 3

    // we can set an array index as a array param in fakeXHR.respond:
    fakeXHR.respond({
        body : 'ajax returned text'
    }, index );

    // we just got the ok() for xhr3

    // without the index parameter, respond() will get the first request in line
    // the first is considered the oldest in fakeXHR.requests collection
    fakeXHR.respond({
        body : 'other ajax returned text'
    });

    // now we got the ok() for xhr1 (first placed request)
});
```

### fakeXHR.spy and Sync requests

Dexter.fakeXHR() objects have an abstraction to spy requests and you can check them right after the XHR `.send()` method, this is great to sync requests considering you can trigger the fakeXHR.respond inside the callback function:

```javascript
function foo() {
  xhr = new XMLHttpRequest();
  xhr.open( 'GET', '/myurl.json', false );
  xhr.send( null );
  return xhr.responseText;
}

test( 'foo()', 2, function() {
  var fake = Dexter.fakeXHR(),
      spy = fake.spy( function() {
        ok( true, 'foo() sent something to a XHR' );
        // 
        fake.respond({
          body: 'bar'
        });
      }),
      returned = foo();
  strictEqual( returned, 'bar', 'foo() returned responseText from sync XHR' );
});
```
