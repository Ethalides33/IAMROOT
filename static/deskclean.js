document.addEventListener("DOMContentLoaded", function () {

    const elements = [{ "Name": "mouse", "positionxgood": "309px", "positionygood": "540px", "positionxbad": "200px", "positionybad": "400px" },
    { "Name": "keys", "positionxgood": "320px", "positionygood": "130px", "positionxbad": "300px", "positionybad": "100px" },
    { "Name": "wallet", "positionxgood": "295px", "positionygood": "600px", "positionxbad": "50px", "positionybad": "500px" },
    { "Name": "screen", "positionxgood": "194px", "positionygood": "384px", "positionxbad": "150px", "positionybad": "200px" },
    { "Name": "keyboard", "positionxgood": "293px", "positionygood": "384px", "positionxbad": "300px", "positionybad": "300px" },
    { "Name": "mug", "positionxgood": "270px", "positionygood": "200px", "positionxbad": "150px", "positionybad": "500px" },
    { "Name": "casse_tete", "positionxgood": "305px", "positionygood": "740px", "positionxbad": "150px", "positionybad": "600px" },
    { "Name": "chien", "positionxgood": "257px", "positionygood": "554px", "positionxbad": "250px", "positionybad": "300px" },
    ];

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
});



function addTouchMoveListener(elementId) {
    const element = document.getElementById(elementId.Name);

    element.addEventListener('touchmove', function (e) {
        const touchLocation = e.targetTouches[0];
        element.style.left = touchLocation.pageX + 'px';
        element.style.top = touchLocation.pageY + 'px';
    });
};

function shakePosition(elementId) {
    var element = document.getElementById(elementId.Name);   
    element.style.left = elementId.positionxbad;
    element.style.top = elementId.positionybad;
};

function parsePosition(position) {
    return parseInt(position.slice(0, -2));
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
    if (points < 0){
        points = 0;
    }



    function scoreDisplay(points) {
        const pointsDiv = document.getElementById('points');
        const pointsTitle = document.getElementById('pointsTitle');
        pointsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        const texte = "SCORE : " + Math.round(points);
        pointsTitle.textContent = texte;
    };

    function countdown(secondes) {
        const timerDisplay = document.getElementById('timerTitle');
        let seconds = secondes;
        timerDisplay.textContent = seconds;
        const countdownInterval = setInterval(function () {
            seconds--;
            timerDisplay.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = 'Terminé !';
            }
        }, 1000); // Mettre à jour chaque seconde (1000 millisecondes = 1 seconde)
    }
    function instructions(text) {
        const instructionsDisplay = document.getElementById('instructions');
        instructionsDisplay.textContent = text;

    }
    function showImageGood(elementId) {
        const element = document.getElementById(elementId.Name + "Good");
        element.style.display = "block";
        element.style.opacity = 0.3;
        element.style.left = elementId.positionxgood;
        element.style.top = elementId.positionygood;
    }

    instructions(" Mémorisez");
    countdown(10);
    setTimeout(function () { instructions(""); elements.forEach(shakePosition); elements.forEach(addTouchMoveListener); countdown(15); }, 10000);

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
                    score: points,
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
                window.location.href = '/leaderboard';
            }
            counter += 1;
        }, 1000);
    }, 25000);

};
