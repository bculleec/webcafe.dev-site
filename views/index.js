
// const canvas = document.querySelector('.main-view');
// canvas.width = window.innerWidth;
// canvas.height= window.innerHeight;

// canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);


const socket = new WebSocket(wsUrl);

/* keep track of all players on the client */
let playerMap = {  };

socket.addEventListener('open', event => {
    const q = document.querySelector('#q');
    q.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            let chan = 'global';
            if (q.value.trim().split(' ')[0]?.charAt(0) === '/') { chan = q.value.trim().split(' ')[0]?.substring(1) }
            socket.send(JSON.stringify({type: 'message', q: q.value, chan: chan}));
            q.value = '';
        }
    });

    document.querySelectorAll('.join-chan').forEach(btn => {
        btn.addEventListener('click', e => {
            socket.send(JSON.stringify({type: 'join-chan', chan: e.target.name}));
        });
    });

    // document.querySelector('.leave-chan').addEventListener('click', e => {
    //     socket.send(JSON.stringify({type: 'leave-chan'}));
    // });

    setInterval(ping, 2000, socket);

});

function ping(socket) {
    socket.send(JSON.stringify({type: 'ping'}));
    console.log('pinged server');
}


socket.addEventListener('message', event => {
    // console.log('Message from server: ', event.data);

    const dataJson = JSON.parse(event.data);
    // console.log(dataJson);

    if (dataJson.type === 'logs' || dataJson.type === 'error') {
        document.querySelector('.logs').innerText += dataJson.logText;
        const breakTag = document.createElement('br');
        document.querySelector('.logs').appendChild(breakTag);
    } else if (dataJson.type === 'ulist-update') {
        document.querySelector('.ulist').innerText = '';
        dataJson.ulist?.forEach(user => {
            const ulistUser = document.createElement('div');
            ulistUser.innerText = user;
            ulistUser.id = 'user' + user;
            document.querySelector('.ulist').appendChild(ulistUser);

            // take this as the new source of truth for all player positions

        });
    } else if (dataJson.type === 'playerPositions') {
        if (dataJson.refresh) { 
            console.log('refreshing all positions'); 
            playerMap = { };
        }
        for (const newPosition of Object.keys(dataJson.positions)) {
            /* update the player position */
            playerMap[newPosition] = dataJson.positions[newPosition];
            playerMap[newPosition].self = dataJson.positions[newPosition].self;
            playerMap[newPosition].color = dataJson.positions[newPosition].color;

            playerMap[newPosition]._display_name = dataJson.positions[newPosition]._display_name;
            if (document.getElementById('user' + newPosition)) { document.getElementById('user' + newPosition).innerText = newPosition + ' (' + dataJson.positions[newPosition]._display_name + ')'; }
        }
    }
});

function sendPositionsToServer(x, y) {
    console.log('sending target position to server');
    socket.send(JSON.stringify({type: 'move', targetPos: { x,  y}}));
}

document.getElementById('q').addEventListener('mousedown', e => {
    e.stopPropagation();
});
document.getElementById('q').addEventListener('click', e => {
    e.stopPropagation();
});

document.getElementById('input-username').addEventListener('mousedown', e => {
    e.stopPropagation();
});
document.getElementById('input-username').addEventListener('click', e => {
    e.stopPropagation();
});

document.getElementById('username-form').addEventListener('submit', e => {
    e.preventDefault();

    /* send the server what we want to be called */
    const payload = { type: 'set_name', username: document.getElementById('input-username').value.trim() };

    socket.send(JSON.stringify(payload));

    document.querySelector('.enter-name').style.display = 'none';
    window.notMoveAllowed = false;
});

/* canvas redraw loop */
// function drawPlayers() {
//     canvas.getContext('2d').fillStyle = 'black';
//     canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);

//     for (const player of Object.values(playerMap)) {
//         canvas.getContext('2d').fillStyle = 'white';
//         canvas.getContext('2d').fillRect(player.x, player.y, 10, 10);
//     }

//     window.requestAnimationFrame(drawPlayers);
// }

// drawPlayers();
