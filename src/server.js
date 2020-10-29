const app = require('express')();
const http = require('http').createServer(app);
const parser = require('socket.io-json-parser');
const io = require('socket.io')(http, { parser });

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat-message', msg => {
    console.log('got message: ', msg); // TODO rm
    msg['ts'] = Date.now() / 1000; // utc seconds
    io.emit('chat-message', msg); // send the message to everyone
  });
});

http.listen(4000, () => {
  console.log('listening on port 4000');
});
