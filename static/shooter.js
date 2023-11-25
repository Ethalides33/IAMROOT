// game.js

document.addEventListener("DOMContentLoaded", function () {

    var canvas = document.getElementById("shooter-canvas");
    var ctx = canvas.getContext("2d");
    canvas.style.backgroundColor = "white";

    var playerImage = new Image();
    playerImage.src = "/static/images/avatar.png"
    playerImage.width = 50; // Set the width of the player image
    playerImage.height = 50; // Set the height of the player image

    var enemyImage_printer = new Image();
    enemyImage_printer.src = "/static/images/brokenprinter.png";
    enemyImage_printer.width = Math.floor(playerImage.width * (2 / 3.))
    enemyImage_printer.height = Math.floor(playerImage.width * (2 / 3.))

    var enemyImage_merge = new Image();
    enemyImage_merge.src = "/static/images/mergeconflict.png";
    enemyImage_merge.width = Math.floor(1.5*playerImage.width)
    enemyImage_merge.height = Math.floor(playerImage.height)


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

    function resetBackground() {
        canvas.style.backgroundColor = "white";

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
                explode(enemy.x+enemy.texture.width/2,enemy.y+enemy.texture.height/2)
                enemies.splice(i, 1);
                score += 10;
                return; // Exit the loop if a hit is detected
            }
        }
    }

    function updateGame() {
        // Generate enemies attracted to the player
        if (Math.random() < 0.02) {
            var dice = Math.floor(Math.random() * 2);
            var enemyText;
            switch (dice) {
                case 0:
                    enemyText = enemyImage_merge;
                    console.log(dice);
                    break;
                case 1:
                    enemyText = enemyImage_printer;
            }
            var enemy = {
                radius: enemyText.width,
                speed: Math.random() * 2 + 1, // Random speed between 1 and 3
                texture: enemyText
            };
            console.log(enemy.texture.src);
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
                enemies.splice(index, 1);
                score -= 10;
                score = Math.max(0, score);
                canvas.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
                setTimeout(resetBackground, 100);
            }
        });

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        // Request the next animation frame
        requestAnimationFrame(updateGame);
    }

    // Start the game loop
    updateGame();
    // explosion construction
    function explode(x, y) {
        var particles = 15,
            // explosion container and its reference to be able to delete it on animation end
            explosion = $('<div class="explosion"></div>');

        // put the explosion container into the body to be able to get it's size
        $('body').append(explosion);

        // position the container to be centered on click
        explosion.css('left', x - explosion.width() / 2);
        explosion.css('top', y - explosion.height() / 2);

        for (var i = 0; i < particles; i++) {
            // positioning x,y of the particle on the circle (little randomized radius)
            var x = (explosion.width() / 2) + rand(80, 150) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
                y = (explosion.height() / 2) + rand(80, 150) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
                color = rand(100, 255) + ', ' + rand(0, 50) + ', ' + rand(0, 100), // randomize the color rgb
                // particle element creation (could be anything other than div)
                elm = $('<div class="particle" style="' +
                    'background-color: rgb(' + color + ') ;' +
                    'top: ' + y + 'px; ' +
                    'left: ' + x + 'px"></div>');

            if (i == 0) { // no need to add the listener on all generated elements
                // css3 animation end detection
                elm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
                    explosion.remove(); // remove this explosion container when animation ended
                });
            }
            explosion.append(elm);
        }
    }

    // get random number between min and max value
    function rand(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    }
});
