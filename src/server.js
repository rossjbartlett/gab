const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat-message', msg => {
    console.log('got message: ' + msg);
    io.emit('chat-message', msg); // send the message to everyone
  });
});

http.listen(4000, () => {
  console.log('listening on port 4000');
});
