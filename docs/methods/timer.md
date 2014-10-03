# Dexter.timer()

This function changes the default behaviour of setTimeout, setInterval, clearTimeout and clearInterval functions so you can manipulate the delay time through code.

Lets suppose that you set the setTimeout for 3000ms, with Dexter.timer you can use Timer.tick function to forcefully make the 3000ms advance instantly , or if you have a setInterval of 1000ms, you can forcefully make the function run as many times you want using Timer.tick()

### Timer.tick(number)

Tick is the function that forces time advance, it receives the number of miliseconds that you want to instantly advance. For example, if you have an instance of `setTimeout` or a `setInterval` with the timer set for 1000ms, you can call `Timer.tick(1000)` to make the instance run instantly.

### Timer.restore()

This function restores setTimeout, setInterval, clearTimeout and clearInterval to their original behaviours. 

## Examples

### setTimeout
```javascript
var timer = Dexter.timer(),
    count = 0;

setTimeout(function() {
    count++;
}, 4000 );

timer.tick( 4000 );

console.log(count) // 1
```

### setInterval
```javascript
var timer = Dexter.timer(),
    count = 0;

setInterval(function() {
    count++;
}, 4000 );

timer.tick( 8000 );

console.log(count) // 2
```

```javascript

/*** in your tests: ***/

test( 'foo()', function() {
    var spy = Dexter.timer(),
        count = 0;

    setTimeout(function() {
        count++;
    }, 4000 );

    timer.tick( 4000 );

    // now we check the value of the count variable
    equal( count, 1, 'count equal to 1' );

    expect( 1 );
});
```