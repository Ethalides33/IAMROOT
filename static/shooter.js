// game.js

document.addEventListener("DOMContentLoaded", function () {

    var canvas = document.getElementById("shooter-canvas");
    var ctx = canvas.getContext("2d");
    canvas.style.backgroundColor = "white";

    var background = new Image();
    background.src = "/static/images/office.png";

    var playerImage = new Image();
    playerImage.src = "/static/images/avatar.png";
    playerImage.width = 50; // Set the width of the player image
    playerImage.height = 50; // Set the height of the player image

    var enemyImage_printer = new Image();
    enemyImage_printer.src = "/static/images/brokenprinter.png";
    enemyImage_printer.width = Math.floor(playerImage.width * (2 / 3.));
    enemyImage_printer.height = Math.floor(playerImage.width * (2 / 3.));

    var enemyImage_merge = new Image();
    enemyImage_merge.src = "/static/images/mergeconflict.png";
    enemyImage_merge.width = Math.floor(1.5 * playerImage.width);
    enemyImage_merge.height = Math.floor(playerImage.height);

    var enemyImage_emails = new Image();
    enemyImage_emails.src = "/static/images/emails.png";
    enemyImage_emails.width = Math.floor(playerImage.width);
    enemyImage_emails.height = Math.floor(playerImage.height);

    var enemyImage_bluescreen = new Image();
    enemyImage_bluescreen.src = "/static/images/bluescreen.png";
    enemyImage_bluescreen.width = Math.floor(playerImage.width);
    enemyImage_bluescreen.height = Math.floor(playerImage.height);

    var successSound = new Audio('/static/images/good.mp3');
    var damageSound = new Audio('/static/images/cutexplosionSound.wav');

    // Player score
    var score = 0;

    // Player object
    var player = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        radius: playerImage.width / 2.5,
    };

    // Enemies array
    var enemies = [];


    var showText_plus = false;
    var showText_minus = false;
    var textY = 0;
    var textX = 0;

    // Event listeners for mouse click or touch
    canvas.addEventListener("mousedown", handleMouseDown, false);
    canvas.addEventListener("touchstart", handleTouchStart, false);

    function handleMouseDown(event) {
        var mouseX = event.clientX - canvas.getBoundingClientRect().left;
        var mouseY = event.clientY - canvas.getBoundingClientRect().top;

        checkHit(mouseX, mouseY);
    }

    function handleTouchStart(event) {
        var touchX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
        var touchY = event.touches[0].clientY - canvas.getBoundingClientRect().top;

        checkHit(touchX, touchY);
    }

    function checkHit(x, y) {
        // Check if the click/tap hits any enemy
        for (var i = enemies.length - 1; i >= 0; i--) {
            var enemy = enemies[i];
            if (
                x > enemy.x - enemy.radius &&
                x < enemy.x + enemy.radius &&
                y > enemy.y - enemy.radius &&
                y < enemy.y + enemy.radius
            ) {
                // Remove the enemy and increase the score
                successSound.load();
                successSound.play();
                render.play();
                showText_plus=true;
                textX = enemy.x;
                textY = enemy.y;
                animateParticules(enemy.x, enemy.y, "+10 !");
                enemies.splice(i, 1);
                score += 10;
                return; // Exit the loop if a hit is detected
            }
        }
    }

    function updateGame() {
        // Generate enemies attracted to the player
        if (Math.random() < 0.02) {
            var dice = Math.floor(Math.random() * 4);
            console.log(dice);
            var enemyText;
            switch (dice) {
                case 0:
                    enemyText = enemyImage_merge;
                    break;
                case 1:
                    enemyText = enemyImage_printer;
                    break;
                case 2:
                    enemyText = enemyImage_emails;
                    break;
                case 3:
                    enemyText = enemyImage_bluescreen;
            }
            var enemy = {
                radius: enemyText.width,
                speed: Math.random() * 2 + 1, // Random speed between 1 and 3
                texture: enemyText
            };
            // Initialize enemy position at the border of the canvas and above half the height
            var borderPosition = Math.random() * 2; // 0: left/right border, 1: top/bottom border
            if (borderPosition < 1) {
                // Left or right border
                enemy.x = (borderPosition < 0.5) ? -enemy.radius : canvas.width + enemy.radius;
                enemy.y = Math.random() * canvas.height;
            } else {
                // Top or bottom border
                enemy.x = Math.random() * canvas.width;
                enemy.y = -enemy.radius
            }

            enemies.push(enemy);
        }

        // Update enemy positions
        enemies.forEach(function (enemy, index) {
            // Move enemies towards the player
            var angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;

            // Remove enemies that go out of the canvas
            if (
                enemy.x < -enemy.radius ||
                enemy.x > canvas.width + enemy.radius ||
                enemy.y < -enemy.radius ||
                enemy.y > canvas.height + enemy.radius
            ) {
                enemies.splice(index, 1);
            }

            // Check if an enemy touches the player
            if (
                player.x > enemy.x - enemy.radius &&
                player.x < enemy.x + enemy.radius &&
                player.y > enemy.y - enemy.radius &&
                player.y < enemy.y + enemy.radius
            ) {
                // Player hit! 
                damageSound.load();
                damageSound.play();
                showText_minus = true;
                enemies.splice(index, 1);
                score -= 10;
                score = Math.max(0, score);
                applyRedTranslucentEffect();
            }
        });

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw the player
        ctx.drawImage(playerImage, player.x, player.y, playerImage.width, playerImage.height);

        // Draw the enemies
        enemies.forEach(function (enemy) {
            ctx.drawImage(enemy.texture, enemy.x, enemy.y, enemy.texture.width, enemy.texture.height);
        });


        // Display the score
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("Score: " + score, 20, 30);

        if(showText_plus){
            showArcadeText(textX,textY,"+10 !","#2CEAF7");
            showText_plus= false;
        }
        if(showText_minus){
            showArcadeText(player.x+25,player.y,"-5 !","#DA0646");
            showText_minus = false;
        }

        // Request the next animation frame
        requestAnimationFrame(updateGame);
    }

    // Start the game loop
    updateGame();

    var numberOfParticules = 30;

    var colors = ['#9b2948', '	#ff7251', '#ffca7b', '#ffcd74', '#ffedbf'];

    var overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    overlay.style.pointerEvents = "none"; // Allow interaction with elements beneath the overlay
    overlay.style.display = "none"; // Hide the overlay by default

    document.body.appendChild(overlay);



    var container = document.createElement("div");
    container.style.position = "relative";
    document.body.appendChild(container);

    // Append the canvas to the container
    container.appendChild(canvas);

    // Function to apply the red translucent effect
    function applyRedTranslucentEffect() {
        overlay.style.display = "block"; // Show the overlay
        setTimeout(resetBackground, 100);
    }
    function resetBackground() {
        overlay.style.display = "none"; // Hide the overlay after a short delay
    }



    function showArcadeText(x, y, text, color) {
        var textElement = document.createElement("div");
        textElement.style.position = "absolute";
        textElement.style.left = x + "px";
        textElement.style.top = y + "px";
        textElement.style.font = "bold 24px Arial";
        textElement.style.color = color;
        textElement.textContent = text;

        // Set a higher z-index for the text element
        textElement.style.zIndex = "1";

        container.appendChild(textElement);

        // Optionally, clear the textElement after a certain duration
        var timeoutId = setTimeout(function () {
            container.removeChild(textElement);
        }, 500); // Adjust the duration as needed
    }


    function setParticuleDirection(p) {
        var angle = anime.random(0, 360) * Math.PI / 180;
        var value = anime.random(50, 180);
        var radius = [-1, 1][anime.random(0, 1)] * value;
        return {
            x: p.x + radius * Math.cos(angle),
            y: p.y + radius * Math.sin(angle)
        }
    }

    function createParticule(x, y) {
        var p = {};
        p.x = x;
        p.y = y;
        p.color = colors[anime.random(0, colors.length - 1)];
        p.radius = anime.random(16, 32);
        p.endPos = setParticuleDirection(p);
        p.draw = function () {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        return p;
    }

    function createCircle(x, y) {
        var p = {};
        p.x = x;
        p.y = y;
        p.color = '#FF0000';
        p.radius = 1;
        p.alpha = .5;
        p.lineWidth = 6;
        p.draw = function () {
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
            ctx.lineWidth = p.lineWidth;
            ctx.strokeStyle = p.color;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        return p;
    }

    function renderParticule(anim) {
        for (var i = 0; i < anim.animatables.length; i++) {
            anim.animatables[i].target.draw();
        }
    }

    function animateParticules(x, y) {
        var circle = createCircle(x, y);
        var particules = [];
        for (var i = 0; i < numberOfParticules; i++) {
            particules.push(createParticule(x, y));
        }
        anime.timeline().add({
            targets: particules,
            x: function (p) { return p.endPos.x; },
            y: function (p) { return p.endPos.y; },
            radius: 0.1,
            duration: anime.random(1200, 1800),
            easing: 'easeOutExpo',
            update: renderParticule
        })
            .add({
                targets: circle,
                radius: anime.random(40, 80),
                lineWidth: 0,
                alpha: {
                    value: 0,
                    easing: 'linear',
                    duration: anime.random(600, 800),
                },
                duration: anime.random(600, 900),
                easing: 'easeOutExpo',
                update: renderParticule,
                offset: 0
            });
    }

    var render = anime({
        duration: Infinity,
        update: function () {
            ctx.clearRect(0, 0, ctx.width, ctx.height);
        }
    });


});
