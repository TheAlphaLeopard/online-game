const socket = io();

socket.on('message', (message) => {
    const messagesDiv = document.getElementById('messages');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    messagesDiv.appendChild(newMessage);
});

function createRoom() {
    const room = document.getElementById('roomInput').value;
    socket.emit('createRoom', room);
}

function joinRoom() {
    const room = document.getElementById('roomInput').value;
    socket.emit('joinRoom', room);
}

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

function preload() {
    // Load assets
}

function create() {
    // Initialize game
}

function update() {
    // Game logic
}
