const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

const rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', ({ name, room, password }) => {
        if (rooms[room]) {
            socket.emit('message', 'Room already exists');
            return;
        }
        rooms[room] = { password, users: [name] };
        socket.join(room);
        console.log(`Room created: ${room}`);
        io.to(room).emit('message', `${name} created the room`);
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
        rooms[room].users.push(name);
        socket.join(room);
        console.log(`Joined room: ${room}`);
        io.to(room).emit('message', `${name} joined the room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Handle user disconnection from rooms (optional)
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
