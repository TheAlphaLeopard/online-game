const socket = io();
let currentRoom = null;

socket.on('message', (message) => {
    displayMessage(message);
});

socket.on('updateMousePositions', (players) => {
    updateMousePositions(players);
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
let localPlayer = null;

function preload() {
    // Load assets if necessary
}

function create() {
    playerGroup = this.add.group();

    this.input.on('pointermove', (pointer) => {
        if (currentRoom) {
            const { x, y } = pointer;
            socket.emit('mouseMove', { room: currentRoom, x, y });
        }
    });
}

function update() {
    // Game logic
}

function updateMousePositions(players) {
    playerGroup.clear(true, true);
    players.forEach(player => {
        const circle = game.scene.scenes[0].add.circle(player.x, player.y, 10, 0x6666ff);
        const text = game.scene.scenes[0].add.text(player.x, player.y - 15, player.name, { color: '#000' })
            .setOrigin(0.5, 0.5);
        playerGroup.add(circle);
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
