## Dexter.restore()

You can simple restore all mocked - with _.fake()_ & _.spy()_ methods - using the Dexter.restore() function.

```javascript
var my_fake = Dexter.fake( window, 'foo' ),
    my_spy  = Dexter.spy( window, 'bar' );

/* your tests magics and assertions here */ 

// restoring my_fake and my_spy
Dexter.restore();
```

It's also simple to seek for any faked objects on `Dexter.stored`. It's an array of all not yet restored functions from Dexter.