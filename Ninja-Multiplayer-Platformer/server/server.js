const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

const rooms = {};

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '0x';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return parseInt(color);
}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', ({ name, room, password }) => {
        if (rooms[room]) {
            socket.emit('message', 'Room already exists');
            return;
        }
        rooms[room] = { password, players: [{ id: socket.id, name, x: 0, y: 0, color: getRandomColor() }] };
        socket.join(room);
        socket.emit('message', `Room created: ${room}`);
        io.to(room).emit('updateMousePositions', rooms[room].players);
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
        if (rooms[room].players.some(player => player.id === socket.id)) {
            socket.emit('message', 'You are already in this room');
            return;
        }
        if (rooms[room].players.some(player => player.name === name)) {
            socket.emit('message', 'Name already taken in this room');
            return;
        }
        rooms[room].players.push({ id: socket.id, name, x: 0, y: 0, color: getRandomColor() });
        socket.join(room);
        socket.emit('message', `Joined room: ${room}`);
        io.to(room).emit('updateMousePositions', rooms[room].players);
    });

    socket.on('leaveRoom', ({ room }) => {
        if (rooms[room]) {
            const index = rooms[room].players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                rooms[room].players.splice(index, 1);
                socket.leave(room);
                io.to(room).emit('updateMousePositions', rooms[room].players);
                if (rooms[room].players.length === 0) {
                    delete rooms[room];
                }
                socket.emit('message', `Left room: ${room}`);
            }
        }
    });

    socket.on('mouseMove', ({ room, x, y }) => {
        const player = rooms[room]?.players.find(p => p.id === socket.id);
        if (player) {
            player.x = x;
            player.y = y;
            io.to(room).emit('updateMousePositions', rooms[room].players);
        }
    });

    socket.on('disconnect', () => {
        for (const room of Object.keys(rooms)) {
            const index = rooms[room].players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                rooms[room].players.splice(index, 1);
                io.to(room).emit('updateMousePositions', rooms[room].players);
                if (rooms[room].players.length === 0) {
                    delete rooms[room];
                }
                break;
            }
        }
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
