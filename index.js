const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const handleSocketConnections = require('./src/socket/socketHandler'); // הייבוא החדש

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// הפעלת ה-Handler
handleSocketConnections(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});