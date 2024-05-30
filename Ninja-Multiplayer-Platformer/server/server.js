const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

const rooms = {};

const GRID_SIZE = 3;
const MAX_PLAYERS = GRID_SIZE * GRID_SIZE;

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', ({ name, room, password }) => {
        if (rooms[room]) {
            socket.emit('message', 'Room already exists');
            return;
        }
        rooms[room] = { password, players: [{ id: socket.id, name, x: 0, y: 0 }] };
        socket.join(room);
        console.log(`Room created: ${room}`);
        io.to(room).emit('updatePlayers', rooms[room].players);
    });

    socket.on('joinRoom', ({ name, room, password }) => {
        if (!rooms[room]) {
            socket.emit('message', 'Room does not exist');
            return;
        }
        if (rooms[room].password !== password) {
            socket.emit('message', 'Incorrect password');
            return;
        }
        if (rooms[room].players.length >= MAX_PLAYERS) {
            socket.emit('message', 'Room is full');
            return;
        }
        const emptySpot = findEmptySpot(rooms[room].players);
        rooms[room].players.push({ id: socket.id, name, ...emptySpot });
        socket.join(room);
        console.log(`Joined room: ${room}`);
        io.to(room).emit('updatePlayers', rooms[room].players);
    });

    socket.on('move', ({ room, direction }) => {
        const player = rooms[room]?.players.find(p => p.id === socket.id);
        if (player) {
            const originalPosition = { x: player.x, y: player.y };
            switch (direction) {
                case 'left':
                    player.x = Math.max(0, player.x - 1);
                    break;
                case 'right':
                    player.x = Math.min(GRID_SIZE - 1, player.x + 1);
                    break;
                case 'up':
                    player.y = Math.max(0, player.y - 1);
                    break;
                case 'down':
                    player.y = Math.min(GRID_SIZE - 1, player.y + 1);
                    break;
            }
            if (isOccupied(rooms[room].players, player.x, player.y)) {
                player.x = originalPosition.x;
                player.y = originalPosition.y;
            }
            io.to(room).emit('updatePlayers', rooms[room].players);
        }
    });

    socket.on('disconnect', () => {
        for (const room of Object.keys(rooms)) {
            const index = rooms[room].players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                rooms[room].players.splice(index, 1);
                io.to(room).emit('updatePlayers', rooms[room].players);
                if (rooms[room].players.length === 0) {
                    delete rooms[room];
                }
                break;
            }
        }
        console.log('Client disconnected:', socket.id);
    });
});

function findEmptySpot(players) {
    const spots = Array.from({ length: GRID_SIZE }, (_, y) => 
        Array.from({ length: GRID_SIZE }, (_, x) => ({ x, y })))
        .flat();
    for (const player of players) {
        const index = spots.findIndex(spot => spot.x === player.x && spot.y === player.y);
        if (index !== -1) {
            spots.splice(index, 1);
        }
    }
    return spots[0];
}

function isOccupied(players, x, y) {
    return players.some(player => player.x === x && player.y === y);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
