const initSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        socket.on('join', (userId) => {
            socket.join(userId);
            socket.emit('joined', { message: 'Connected', userId });
        });
        socket.on('disconnect', () => console.log(`🔌 Disconnected: ${socket.id}`));
    });
};
module.exports = initSockets;
