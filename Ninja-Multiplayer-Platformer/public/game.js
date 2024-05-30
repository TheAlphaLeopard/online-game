const socket = io();
let currentRoom = null;

socket.on('message', (message) => {
    displayMessage(message);
});

socket.on('updatePlayers', (players) => {
    updatePlayers(players);
});

function createRoom() {
    const name = document.getElementById('nameInput').value;
    const room = document.getElementById('roomInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!currentRoom) {
        socket.emit('createRoom', { name, room, password });
        currentRoom = room;
    } else {
        displayMessage(`You are already in a room: ${currentRoom}`);
    }
}

function joinRoom() {
    const name = document.getElementById('nameInput').value;
    const room = document.getElementById('roomInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!currentRoom) {
        socket.emit('joinRoom', { name, room, password });
        currentRoom = room;
    } else {
        displayMessage(`You are already in a room: ${currentRoom}`);
    }
}

let selectedSquare = null;

document.addEventListener('keydown', (event) => {
    if (!currentRoom || !selectedSquare) return;
    switch (event.key) {
        case 'ArrowLeft':
            socket.emit('move', { room: currentRoom, direction: 'left' });
            break;
        case 'ArrowRight':
            socket.emit('move', { room: currentRoom, direction: 'right' });
            break;
        case 'ArrowUp':
            socket.emit('move', { room: currentRoom, direction: 'up' });
            break;
        case 'ArrowDown':
            socket.emit('move', { room: currentRoom, direction: 'down' });
            break;
    }
});

const GRID_SIZE = 3;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: 'gameContainer',
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
        const square = game.scene.scenes[0].add.rectangle(x, y, size - 10, size - 10, 0x6666ff).setInteractive();
        const text = game.scene.scenes[0].add.text(x, y, player.name, { color: '#000' }).setOrigin(0.5, 0.5);
        
        square.on('pointerdown', () => {
            selectedSquare = player.id === socket.id ? square : null;
        });

        playerGroup.add(square);
        playerGroup.add(text);
    });
}

let messageCounts = {};

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    if (messageCounts[message]) {
        messageCounts[message]++;
    } else {
        messageCounts[message] = 1;
    }
    const messagesArray = Object.entries(messageCounts).map(
        ([msg, count]) => `${msg} x${count}`
    );
    messagesDiv.innerHTML = messagesArray.join('<br>');
}
