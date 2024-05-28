const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', (room) => {
        socket.join(room);
        console.log(`Room created: ${room}`);
        io.to(room).emit('createSquare', { id: socket.id });
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Joined room: ${room}`);
        io.to(room).emit('createSquare', { id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
