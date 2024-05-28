const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files using http-server
exec('http-server -p 8080 -c-1 Ninja-Multiplayer-Platformer/public');

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (room) => {
        socket.join(room);
        console.log(`Room created: ${room}`);
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Joined room: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
