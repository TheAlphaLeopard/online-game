const socket = io();

socket.on('message', (message) => {
    const messagesDiv = document.getElementById('messages');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    messagesDiv.appendChild(newMessage);
});

socket.on('updatePlayers', (players) => {
    updatePlayers(players);
});

function createRoom() {
    const name = document.getElementById('nameInput').value;
    const room = document.getElementById('roomInput').value;
    const password = document.getElementById('passwordInput').value;
    socket.emit('createRoom', { name, room, password });
}

function joinRoom() {
    const name = document.getElementById('nameInput').value;
    const room = document.getElementById('roomInput').value;
    const password = document.getElementById('passwordInput').value;
    socket.emit('joinRoom', { name, room, password });
}

document.addEventListener('keydown', (event) => {
    const room = document.getElementById('roomInput').value;
    switch (event.key) {
        case 'ArrowLeft':
            socket.emit('move', { room, direction: 'left' });
            break;
        case 'ArrowRight':
            socket.emit('move', { room, direction: 'right' });
            break;
        case 'ArrowUp':
            socket.emit('move', { room, direction: 'up' });
            break;
        case 'ArrowDown':
            socket.emit('move', { room, direction: 'down' });
            break;
    }
});

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let playerGroup;

function preload() {
    // Load assets if necessary
}

function create() {
    playerGroup = this.add.group();
}

function update() {
    // Game logic
}

function updatePlayers(players) {
    playerGroup.clear(true, true);
    const size = game.config.width / GRID_SIZE;
    players.forEach(player => {
        const x = player.x * size + size / 2;
        const y = player.y * size + size / 2;
        const square = game.scene.scenes[0].add.rectangle(x, y, size - 10, size - 10, 0x6666ff);
        const text = game.scene.scenes[0].add.text(x, y, player.name, { color: '#000' })
            .setOrigin(0.5, 0.5);
        playerGroup.add(square);
        playerGroup.add(text);
    });
}
