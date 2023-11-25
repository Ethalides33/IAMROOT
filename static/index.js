document.addEventListener("DOMContentLoaded", function () {
    function uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    $('#submit').on('click', () => {
        if ($('#nickname').val() != '') {
            $('#nickname').prop('disabled', true);
            let nickname = $('#nickname').val();
            let uuid = uuidv4();
            localStorage.setItem('office_game_token', uuid);
            $.ajax({
                url: '/register',
                type: 'POST',
                data: {
                    nickname: nickname,
                    token: uuid,
                }
            })
        }
    });
    setInterval(() => {
        $.ajax({
            url: '/heartbeat',
            type: 'POST',
            data: {
                token: localStorage.getItem('office_game_token') || '',
            },
            success: function (data) {
                counter = 1;
                html = `<div class="row p-0 m-0"><div class="col-12 p-0 m-0 text-center xlsx-head">A</div>`;
                for (const d of data) {
                    html += `<div class="row p-0 m-0"><div class="col-2 p-0 m-0 xlsx-left-num text-center">${counter}</div><div class="col-10 p-0 m-0 xlsx-cell text-center">${d.nickname}</div></div>`
                    counter += 1;
                }
                $('#usersDiv').html(html);
            },
        })
    }, 3000);
});
