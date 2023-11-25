document.addEventListener("DOMContentLoaded", function () {

    const canvas = document.getElementById('coffee-canvas');
    const ctx = canvas.getContext('2d');

    var backgroundImage = new Image();
    backgroundImage.src = "/static/images/lunchroom.jpg";
    backgroundImage.width = canvas.width;
    backgroundImage.height = canvas.height;

    var coffeeDrop_image = new Image();
    coffeeDrop_image.src = "/static/images/coffeedrop.png";
    coffeeDrop_image.width = 30;
    coffeeDrop_image.height = 40;

    var pourcoffee_image = new Image();
    pourcoffee_image.src = "/static/images/pourcoffee.png";
    pourcoffee_image.width = 120;
    pourcoffee_image.height = 130;



    var stanrock = new Image();
    stanrock.src = "/static/images/rock.png";
    var standrop = new Image();
    standrop.src = "/static/images/drop.png";
    var ROCK_WIDTH = '';
    var ROCK_HEIGHT = '';
    var cwidth = canvas.width;
    var cheight = canvas.height;

    var WAVE_FREQ = 5;

    var WAV_PASS = 6;
    //get wave count needed for screen width
    var WAVE_COUNT = canvas.width / WAVE_FREQ + 1;

    //surface of water
    var START_Y = canvas.height / 1.75;
    //the depths
    var END_Y = canvas.height-50;

    //start height
    var HEIGHT = canvas.height-75;

    /*VARIABLES TO TWEAK*/
    //spring constant
    var K = 1;
    //how fast waves spread 0 - 0.5
    var SPREAD = .2;
    //dampening factor
    var DAMP = .04;
    /*tension of spring*/
    var TENSION = .01;
    /*speed*/
    var SPEED = 0;

    var Rock = function (x, y) {
        this.rock = stanrock;
        this.vx = 0;
        this.vy = 8;
        this.speed = 1;
        this.minvy = 4;
        this.maxvy = 18;
        this.splashed = false;
        this.x = x - (stanrock.width / 2);
        this.y = y - (stanrock.height / 2);
    }

    var Particle = function (r, x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.gy = .5;
        this.r = r;
        this.color = "#1c6ba0";
        this.drop = standrop;
    }

    //array of springs / columns for water
    var springs = [];
    var rocks = [];
    var particles = [];

    const coffeeCup = {
        x: 0,
        y: canvas.height - 50,
        width: 100,
        height: 80,
        color: '#8B4513',
        speed: 2,
        fillLevel: 0,
        maxFill: 50,
    };

    // Coffee flask
    const coffeeFlask = {
        x: canvas.width / 2 - 25,
        y: 0,
        width: pourcoffee_image.width,
        height: pourcoffee_image.height,
        color: '#8B4513',
        speed: 0
    };

    // Coffee drops
    const coffeeDrops = [];

    let isDragging = false;
    let offsetX = 0;

    var old_pos = 0;
    var old_time = null;

    // Handle touch events for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        if (touchX > coffeeFlask.x && touchX < coffeeFlask.x + coffeeFlask.width &&
            touchY > coffeeFlask.y && touchY < coffeeFlask.y + coffeeFlask.height) {
            isDragging = true;
            offsetX = touchX - coffeeFlask.x;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const touchX = e.touches[0].clientX;
            const newX = touchX - offsetX;

            if (newX > 0 && newX < canvas.width - coffeeFlask.width) {
                coffeeFlask.x = newX;
            }
        }
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Update the game state
    function update() {

        updateWater();
        updateRocks();
        updateParticles();

        collide();

        if (Math.random() < 0.006) {
            coffeeCup.speed *= -1;
        }
        // Get coffee flask speed
        var now = new Date();
        var current_time = now.getSeconds();
        coffeeFlask.speed = (coffeeFlask.x - old_pos) / (current_time - old_time);
        coffeeFlask.speed *= -25 * Math.pow(10, 10);
        old_pos = coffeeFlask.x;
        old_time = now;
        // Move the coffee cup
        coffeeCup.x += coffeeCup.speed;
        if (coffeeCup.x > canvas.width) {
            coffeeCup.x = 0;
        }
        if (coffeeCup.x < 0) {
            coffeeCup.x = canvas.width;
        }

        // Update coffee drops
        for (let i = 0; i < coffeeDrops.length; i++) {
            coffeeDrops[i].y += coffeeDrops[i].speedY;
            coffeeDrops[i].x += coffeeDrops[i].speedX;
            coffeeDrops[i].speedY += 0.1;

            // Remove drops that have fallen off the screen
            if (coffeeDrops[i].y > canvas.height) {
                coffeeDrops.splice(i, 1);
                i--;
                continue;
            }
            // Check for collision with the coffee cup
            if (intersect(coffeeDrops[i], coffeeCup)) {
                // Increase cup fill level and remove the drop
                var realx = getRealX(coffeeDrops[i].x);
                splash(realx, Math.pow(coffeeDrops[i].speedY, 2) / 5);

                createSplash(coffeeDrops[i]);
                coffeeCup.fillLevel += 0.5;
                coffeeDrops.splice(i, 1);
                i--;
            }
        }

        // Generate new coffee drops from the flask
        if (Math.random() < 0.2) {
            const newDrop = {
                x: coffeeFlask.x + coffeeFlask.width - 10,
                y: coffeeFlask.y + coffeeFlask.height,
                width: 30,
                height: 40,
                speedY: Math.random() * 5 + 2,
                speedX: coffeeFlask.speed
            };
            coffeeDrops.push(newDrop);
        }

        // Ensure the fill level does not exceed the cup height
        coffeeCup.fillLevel = Math.min(coffeeCup.fillLevel, coffeeCup.maxFill);

        // Check if the cup is full
        if (coffeeCup.fillLevel >= coffeeCup.maxFill) {
            alert('Coffee cup full! You win!');
            resetGame();
        }
    }

    // Draw the game elements
    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawParticles();
        drawRocks();
        drawWater();
        // Draw coffee cup
        // ctx.fillStyle = coffeeCup.color;
        // ctx.fillRect(coffeeCup.x, coffeeCup.y + (coffeeCup.height - coffeeCup.fillLevel), coffeeCup.width, coffeeCup.fillLevel);
        //ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);
        // Draw coffee flask
        ctx.fillStyle = coffeeFlask.color;
        ctx.drawImage(pourcoffee_image, coffeeFlask.x, coffeeFlask.y, pourcoffee_image.width, pourcoffee_image.height);
        drawCoffeeCup();

        // Draw coffee drops
        ctx.fillStyle = '#8B4513';
        for (const drop of coffeeDrops) {
            ctx.drawImage(coffeeDrop_image, drop.x, drop.y, drop.width, drop.height);
        }
    }

    function drawCoffeeCup() {
        // Draw cup base
        // ctx.fillStyle = '#8B4513'; // Brown color
        // ctx.beginPath();
        // ctx.moveTo(coffeeCup.x, coffeeCup.y - coffeeCup.fillLevel); // Starting point
        // ctx.lineTo(coffeeCup.x + coffeeCup.fillLevel / Math.tan(9.5 * Math.PI / 20.), coffeeCup.y); // Starting point
        // ctx.lineTo(coffeeCup.x - (coffeeCup.fillLevel / Math.tan(9.5 * Math.PI / 20.)) + coffeeCup.width, coffeeCup.y);
        // ctx.lineTo(coffeeCup.x + coffeeCup.width, coffeeCup.y - coffeeCup.fillLevel);
        // ctx.lineTo(coffeeCup.x, coffeeCup.y - coffeeCup.fillLevel); // Starting point


        // ctx.quadraticCurveTo(100, 150, 250, 300); // Quadratic Bezier curve
        // ctx.lineTo(150, 300); // Connect to the starting point
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(coffeeCup.x - 5, coffeeCup.y - coffeeCup.height); // Starting point
        ctx.lineTo(coffeeCup.x - 5 + coffeeCup.height / Math.tan(9.5 * Math.PI / 20.), coffeeCup.y); // Starting point
        ctx.lineTo(coffeeCup.x + 5 - (coffeeCup.height / Math.tan(9.5 * Math.PI / 20.)) + coffeeCup.width, coffeeCup.y);
        ctx.lineTo(coffeeCup.x + 5 + coffeeCup.width, coffeeCup.y - coffeeCup.height);

        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 10;

        ctx.stroke();
        // Draw cup handle
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(coffeeCup.x + 5 - (3 / 5.) * (coffeeCup.height / Math.tan(9.5 * Math.PI / 20.)) + coffeeCup.width, coffeeCup.y - coffeeCup.height * 2 / 5.);
        ctx.quadraticCurveTo(coffeeCup.x + coffeeCup.width + 75, coffeeCup.y - coffeeCup.height * 0.5, coffeeCup.x + 5 - (1 / 5.) * (coffeeCup.height / Math.tan(9.5 * Math.PI / 20.)) + coffeeCup.width, coffeeCup.y - coffeeCup.height * 4 / 5.);
        ctx.stroke();

    }

    function createSplash(drop) {
        ctx.beginPath();
        ctx.arc(drop.x + drop.width / 2, coffeeCup.y + coffeeCup.height - coffeeCup.fillLevel, 50, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        ctx.closePath();
    }

    // Check if two rectangles intersect
    function intersect(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    // Reset the game state
    function resetGame() {
        coffeeCup.x = 0;
        coffeeCup.fillLevel = 0;
        coffeeFlask.x = canvas.width / 2 - 25;
        coffeeDrops.length = 0;
    }

    // Game loop
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function updateParticles() {
        for (var i = 0; i < particles.length; i++) {
            //Math.atan2(1.5, 5.0)/(Math.PI/180)
            var thisDrop = particles[i];
            thisDrop.x += thisDrop.vx;
            thisDrop.y += thisDrop.vy;
            thisDrop.vy += thisDrop.gy;

            if (thisDrop.y > canvas.height + 200) {
                particles.splice(i, 1);
            }
        }
    }
    //update the springs/water
    function updateWater() {
        //update springs
        for (var i = 0; i < springs.length; i++)
            springs[i].update(i);

        var leftDeltas = [];
        var rightDeltas = [];

        //go through and update springs based off of their siblings
        leftDeltas.length = springs.length;
        rightDeltas.length = springs.length;
        // do some passes where springs pull on their neighbours
        for (var j = 0; j < WAV_PASS; j++) {
            //create arrays for springs to the left and right of each spring/column
            for (var i = 0; i < springs.length; i++) {
                if (i > 0) {
                    leftDeltas[i] = SPREAD * (springs[i].height - springs[i - 1].height);
                    springs[i - 1].speed += leftDeltas[i];
                }
                if (i < springs.length - 1) {
                    rightDeltas[i] = SPREAD * (springs[i].height - springs[i + 1].height);
                    springs[i + 1].speed += rightDeltas[i];
                }
            }

            //update the position of each spring/column based on the sibling/delta arrays
            for (var i = 0; i < springs.length; i++) {
                if (i > 0)
                    springs[i - 1].height += leftDeltas[i];
                if (i < springs.length - 1)
                    springs[i + 1].height += rightDeltas[i];
            }
        }
    }

    function updateRocks() {
        for (var i = 0; i < rocks.length; i++) {
            var thisRock = rocks[i];
            thisRock.x += thisRock.vx;
            thisRock.y += thisRock.vy;
            thisRock.vy += thisRock.speed;

            if (thisRock.y > canvas.height + 200) {
                rocks.splice(i, 1);
            }
            else {
                if (thisRock.vy > thisRock.maxvy) thisRock.vy = thisRock.maxvy;
                else if (thisRock.vy < thisRock.minvy) thisRock.vy = thisRock.minvy;
            }
        }
    }

    /******************
        DRAW
    *******************/
    //draw existing water droplet particles
    function drawParticles() {
        //tempCtx.clearRect(0,0,cwidth,cheight);
        for (var i = 0; i < particles.length; i++) {
            var thisDrop = particles[i];
            //ctx.drawImage(thisDrop.drop, thisDrop.x, thisDrop.y);

            var ph = thisDrop.drop.height;
            var pw = thisDrop.drop.width;

            //with droplet image
            ctx.save();
            ctx.translate(thisDrop.x, thisDrop.y);
            ctx.rotate(-Math.atan2(thisDrop.vx, thisDrop.vy));
            ctx.drawImage(coffeeDrop_image, thisDrop.drop.x,thisDrop.drop.y, pw, ph);
            ctx.restore();


            /*
            //just a particle
            ctx.beginPath();
            ctx.arc(thisDrop.x, thisDrop.y, thisDrop.r, 0, 2 * Math.PI, false);
            ctx.fillStyle = thisDrop.color;
            ctx.fill();
            */

            /*
            //meta balls
            tempCtx.beginPath();
            var grad = tempCtx.createRadialGradient(thisDrop.x, thisDrop.y, 1, thisDrop.x, thisDrop.y, thisDrop.r*2);
            grad.addColorStop(0, 'rgba(28,107,160,1)');
            grad.addColorStop(.8, 'rgba(28,107,160,0)');
            tempCtx.fillStyle = grad;
            tempCtx.arc(thisDrop.x, thisDrop.y, thisDrop.r*2, 0, Math.PI*2);
            tempCtx.fill();
            */
        }

        //if(particles.length > 0)
        //	meta();
    }

    function meta() {
        var imageData = tempCtx.getImageData(0, 0, cwidth, cheight);
        var pix = imageData.data;
        var threshold = 205;

        for (var i = 0, n = pix.length; i < n; i += 4) {
            if (pix[i + 3] < threshold) {
                pix[i + 3] /= 6;
                if (pix[i + 3] > threshold / 4) {
                    pix[i + 3] = 0;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    //draw rocks from array
    function drawRocks() {
        for (var i = 0; i < rocks.length; i++) {
            var thisRock = rocks[i];
            ctx.drawImage(thisRock.rock, thisRock.x, thisRock.y);
        }
    }
    //draw water/columns/springs 
    function drawWater() {
        for (var i = 0; i < springs.length; i++) {
            if (i != springs.length - 1) {
                connectSprings(springs[i], springs[i + 1]);
            }
        }
    }
    //for each spring(lines) fill as a trapezoid
    function connectSprings(vOne, vTwo) {
        //water gradient
        var randBlue = "217";
        var opacity = 0.55; //55% visible

        var col1 = 'rgba(62,30,4,.75)';
        var col2 = 'rgba(106,48,5,.80)';
        var col3 = 'rgba(150,80,21,.85)';
        var col4 = 'rgba(196,146,62, .98)';

        var grd = ctx.createLinearGradient(0, vOne.height, 0, END_Y);
        grd.addColorStop(0, col1);
        grd.addColorStop(.30, col2);
        grd.addColorStop(.5, col3);
        grd.addColorStop(.96, col4);

        //fill water area
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(vOne.x, vOne.height);
        ctx.lineTo(vTwo.x, vTwo.height);
        ctx.lineTo(vTwo.x, END_Y);
        ctx.lineTo(vOne.x, END_Y);
        ctx.lineTo(vOne.x, vOne.height);
        ctx.closePath();
        ctx.fill();
        //ctx.strokeStyle = '#0000FF';
        //ctx.stroke();
    }

    /*******************
        MISCELLANEOUS
    ********************/
    //trigger a splash at this x coordinate with this speed
    function splash(index, sp) {
        if (index >= 0 && index < springs.length) {
            springs[index].speed = sp;

            createSplashParticles(index, sp);
        }
    }
    //create particles at splash location
    function createSplashParticles(x, speed) {
        var y = springs[x].height;
        x = x * WAVE_FREQ;
            for (var i = 0; i < speed / 10; i++) {
                var rvx = Math.floor(Math.random() * (10)) - Math.PI;
                var rvy = -Math.floor(Math.random() * Math.sqrt(speed) * 2);
                var rr = Math.random() * 25;

                var newDrop = new Particle(rr, Math.floor(Math.random() * 20) + x, y, rvx, rvy);
                particles[particles.length] = newDrop;
            }
    }
    //creaate splash on mouse click
    function getPosition(event) {
        var x = event.x;
        var y = event.y;

        var arock = new Rock(x, y);
        rocks[rocks.length] = arock;
    }
    //x coord of closest water column/spring
    function getRealX(x) {
        if (x > 0)
            x = (Math.ceil(x / WAVE_FREQ) * WAVE_FREQ) / WAVE_FREQ;
        else if (x < 0)
            x = (Math.floor(x / WAVE_FREQ) * WAVE_FREQ) / WAVE_FREQ;
        else
            x = x;

        return x;
    }

    /**************
        COLLISION
    ***************/
    function collide() {
        for (var i = 0; i < rocks.length; i++) {
            var thisRock = rocks[i];
            var realx = getRealX(thisRock.x + thisRock.rock.width / 2);
            console.log(realx);
            var thisSpring = springs[realx];

            if (thisRock.splashed == false) {
                if ((thisSpring.height <= thisRock.y + thisRock.vy) &&
                    (thisSpring.height >= thisRock.y - thisRock.vy)) {
                    thisRock.splashed = true;
                    thisRock.speed = -.5;
                    splash(realx, Math.pow(thisRock.vy, 2) / 2);
                }
            }
        }

        for (var i = 0; i < particles.length; i++) {
            var thisDrop = particles[i];
            var realx = getRealX(thisDrop.x);

            var thisSpring = springs[realx];
            if (thisSpring) {
                if (thisSpring.height <= thisDrop.y) {
                    particles.splice(i, 1);
                }
            }
        }
    }
    function init() {
        for (var i = 0; i < WAVE_COUNT; i++) {
            var nw = {};
            nw.x = coffeeCup.x+(i * WAVE_FREQ)*coffeeCup.width/cwidth;
            nw.speed = SPEED;
            nw.height = HEIGHT;
            nw.update = function (j) {
                var x = HEIGHT - this.height;
                this.speed += TENSION * x - this.speed * DAMP;
                this.height += this.speed;
                this.x = coffeeCup.x+(j * WAVE_FREQ)*coffeeCup.width/cwidth;
                HEIGHT = coffeeCup.y - coffeeCup.fillLevel;
            };

            springs[i] = nw;
        }

        gameLoop();
    }
    //begin
    init();
    // Start the game loop
});