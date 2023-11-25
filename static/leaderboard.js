document.addEventListener("DOMContentLoaded", function () {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    $.ajax({
        url: '/leaderboard',
        type: 'POST',
        success: async function (data) {
            let counter = 0;
            for (const d of data) {
                if (counter < 4) {
                    await sleep(1000);
                    counter++;
                } else {
                    await sleep(150);
                }
                html = `<div class="row score_line mb-2"><div class="col-6 text-center">${d.nickname}</div><div class="col-6 text-center">${d.score}</div></div>`
                $('.container').html($('.container').html() + html);
            }
        },
    });
    setInterval(() => {
        $.ajax({
            url: '/heartbeat',
            type: 'POST',
            data: {
                token: localStorage.getItem('office_game_token') || '',
            },
        })
    }, 3000);
});
