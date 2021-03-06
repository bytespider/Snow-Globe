window.addEventListener('load', init, false);

function init() {
    document.body.addEventListener('touchmove', function (e) {e.preventDefault()}, false);
    window.addEventListener('unload', function () {
        clearInterval(mainLoop);
        window.removeEventListener('ondevicemotion', updateAccelerometer, false);
    }, true);

    var c = document.getElementById('canvas');
    var cx = c.getContext("2d");

    cx.fillStyle = 'rgb(255, 255, 255)';

    if (!('ondevicemotion' in window)) {
        alert('Sorry your device doesnt support the accelerometer API');
        return false;
    }

    var i = 0;
    var snowflakes = 200;
    var snowflakesArray = [];
    var d360 = Math.PI*2;

    while(i < snowflakes) {
        snowflakesArray.push(new Snowflake(1 + Math.round(Math.random() * c.width), 0));
        ++i;
    }

    function Snowflake(x, y) {

        this.size = 1 + Math.random() * 2;
        this.x = x;
        this.y = y + Math.round(this.size * 2);
        this.speed = .01 + Math.random()*(.155);
        this.style = "rgba(255, 255, 255, " + (1 + Math.random() * 10) / 10 + ")";
        this.x_mv = .03 + Math.random() / 10;
        this.coords = 0;
    };

    Snowflake.prototype = {
        size: 0,
        x: 0,
        y: 0,
        speed: 0,
        style: '',
        coords: 0,
        x_mv: 0
    };

    var calibration = {x:null, y:null};
    var acceleration = {};

    function updateAccelerometer(e) {
        if (calibration.y == e.accelerationIncludingGravity.y) {
            return false;
        }

        acceleration = e.accelerationIncludingGravity;

        if (calibration.y == null) {
            calibration.x = acceleration.x;
            calibration.y = acceleration.y;
        }
    }

    function draw() {
        if (typeof acceleration.y === 'undefined' || calibration.y == acceleration.y) {
            return false;
        }

        // clear frame
        cx.clearRect(0, 0, c.width, c.height);

        var i = 0;
        while (i < snowflakes) {
            var snowflake = snowflakesArray[i], speed;
            snowflake.coords += snowflake.x_mv;

            if (acceleration.y > calibration.y + 10) {
                speed = acceleration.y * snowflake.speed;
            }
            if (acceleration.y < calibration.y + 10) {
                speed = acceleration.y * snowflake.speed;
            }

            var bounds = (c.height - snowflake.y) + snowflake.size * 2;
            if (bounds > 1 && bounds < c.width && (speed > 0 || speed < 0)) {
                snowflake.x += Math.sin(snowflake.coords);
            }

            snowflake.y -= speed;

            cx.beginPath();
            cx.arc(snowflake.x, snowflake.y, snowflake.size, 0, d360, true);
            cx.fill();
            cx.closePath();

            if (c.height - (snowflake.size * 2) <= snowflake.y) {
                snowflake.y = (c.height - snowflake.size);
            } else if (snowflake.y < 0) {
                snowflake.y = snowflake.size * 2;
            }

            ++i;
        }
    }

    var mainLoop = setInterval(draw, 10);
    window.addEventListener('devicemotion', updateAccelerometer, true);

}
