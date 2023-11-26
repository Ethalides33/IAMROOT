document.addEventListener("DOMContentLoaded", async function () {

    var timer = 7;
    const linkScraper = async () => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    if (timer <= 0) {
                        $('#gameRules').addClass('d-none');
                        resolve()
                    }
                    $('#seconds').text(timer);
                    timer--;
                } catch (e) {
                    clearInterval(interval);
                    reject(e);
                }
            }, 1000);

        });
    }

    await linkScraper();

    const elements = [{ "Name": "mouse", "positionxgood": "309px", "positionygood": "515px", "positionxbad": "200px", "positionybad": "400px" },
    { "Name": "keys", "positionxgood": "320px", "positionygood": "130px", "positionxbad": "300px", "positionybad": "100px" },
    { "Name": "wallet", "positionxgood": "225px", "positionygood": "600px", "positionxbad": "50px", "positionybad": "500px" },
    { "Name": "screen", "positionxgood": "194px", "positionygood": "394px", "positionxbad": "150px", "positionybad": "200px" },
    { "Name": "keyboard", "positionxgood": "285px", "positionygood": "384px", "positionxbad": "300px", "positionybad": "300px" },
    { "Name": "mug", "positionxgood": "280px", "positionygood": "185px", "positionxbad": "150px", "positionybad": "500px" },
    { "Name": "casse_tete", "positionxgood": "300px", "positionygood": "560px", "positionxbad": "150px", "positionybad": "600px" },
    { "Name": "chien", "positionxgood": "257px", "positionygood": "564px", "positionxbad": "250px", "positionybad": "300px" },
    ];

    var container = document.querySelector('.background-image');
    var menu = document.getElementById('score_header');
    container.height = window.innerHeight - menu.offsetHeight;

    setInterval(() => {
        $.ajax({
            url: '/heartbeat',
            type: 'POST',
            data: {
                token: localStorage.getItem('office_game_token') || '',
            },
        })
    }, 3000);
    function hideImageGood(elementId) {
        const element = document.getElementById(elementId.Name + "Good");
        element.style.display = "none";
    }
    elements.forEach(hideImageGood);

    function placeImage(elementId) {
        const element = document.getElementById(elementId.Name);
        element.style.left = elementId.positionxgood;
        element.style.top = elementId.positionygood;
    }
    elements.forEach(placeImage);
    
    function parsePosition(position) {
        return parseInt(position.slice(0, -2));
    };
    function addTouchMoveListener(elementId) {
        const element = document.getElementById(elementId.Name);
        element.addEventListener('touchmove', function (e) {
            const touchLocation = e.targetTouches[0];
            if (parsePosition(element.style.left) + (touchLocation.target.width/2) > self.screen.width ){
                element.style.left = self.screen.width - (touchLocation.target.width/2) + 'px';
                element.style.top = touchLocation.pageY + 'px';             
            } else if (parsePosition(element.style.top) + (touchLocation.target.height/2) > self.screen.height ){
                element.style.top = self.screen.height - (touchLocation.target.height/2) + 'px';   
                element.style.left = touchLocation.pageX + 'px';
            } else {
                element.style.left = touchLocation.pageX + 'px';
                element.style.top = touchLocation.pageY + 'px';
            }
        });
    };

    function shakePosition(elementId) {
        var element = document.getElementById(elementId.Name);
        element.style.left = elementId.positionxbad;
        element.style.top = elementId.positionybad;
    };


    var points = 1000;
    function countPoints(elementId) {
        var element = document.getElementById(elementId.Name);
        xdistance = Math.abs(parsePosition(element.style.left) - parsePosition(elementId.positionxgood));
        ydistance = Math.abs(parsePosition(element.style.top) - parsePosition(elementId.positionygood));
        final_distance = Math.pow(Math.pow(xdistance, 2) + Math.pow(ydistance, 2), 0.5);
        if (final_distance > 125) {
            final_distance = 125;
        }
        points = points - final_distance;
        if (points < 0) {
            points = 0;
        }
    }



    function scoreDisplay(points) {
        const pointsDiv = document.getElementById('points');
        $('.score_header_message').hide();
        $('.score_header_container').removeClass('d-none');
        $('#score').text(Math.round(points));
    };

    function countdown(secondes, message) {
        const timerDisplay = document.getElementById('message');
        let seconds = secondes;
        timerDisplay.textContent = message + " (" + seconds + ")";
        const countdownInterval = setInterval(function () {
            seconds--;
            timerDisplay.textContent = message + " (" + seconds + ")";

            if (seconds <= 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = 'Terminé !';
            }
        }, 1000); // Mettre à jour chaque seconde (1000 millisecondes = 1 seconde)
    }

    function showImageGood(elementId) {
        const element = document.getElementById(elementId.Name + "Good");
        element.style.display = "block";
        element.style.opacity = 0.3;
        element.style.left = elementId.positionxgood;
        element.style.top = elementId.positionygood;
    }

    countdown(10, "Mémorisez");
    setTimeout(function () { elements.forEach(shakePosition); elements.forEach(addTouchMoveListener); countdown(15, "Replacez"); }, 10000);

    let doCall = true;
    setTimeout(function () {
        elements.forEach(countPoints);
        scoreDisplay(points);
        elements.forEach(showImageGood);
        if (doCall) {
            $.ajax({
                url: '/score',
                method: 'POST',
                data: {
                    score: Math.round(points),
                    token: localStorage.getItem('office_game_token')
                },
                success: function (data) {
                    doCall = false;
                },
            })
        }
        let counter = 0;
        setInterval(() => {
            if (counter > 3) {
                window.location.href = '/coffee';
            }
            counter += 1;
        }, 1000);
    }, 25000);
    history.pushState(null, null, window.top.location.pathname + window.top.location.search);
    window.addEventListener('popstate', (e) => {
        e.preventDefault();
        history.pushState(null, null, window.top.location.pathname + window.top.location.search);
    });
});
