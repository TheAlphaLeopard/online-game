const socket = io();

socket.on('message', (message) => {
    const messagesDiv = document.getElementById('messages');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    messagesDiv.appendChild(newMessage);
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
    // Load assets if necessary
}

function create() {
    // Initial game setup
}

function update() {
    // Game logic
}

function createSquare(id) {
    const size = 50;
    const x = Math.random() * (game.config.width - size);
    const y = Math.random() * (game.config.height - size);
    const square = this.add.rectangle(x, y, size, size, 0x6666ff);
    square.setData('id', id);
    this.physics.add.existing(square);
}
