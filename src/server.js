const app = require('express')();
const http = require('http').createServer(app);
const parser = require('socket.io-json-parser');
const io = require('socket.io')(http, { parser });
const rug = require('random-username-generator');

const users = {};

io.on('connection', socket => {
  console.log('a user connected');
  const username = rug.generate();
  users[socket.id] = username;
  socket.emit('set-username', username); // tell client its name

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete users[socket.id];
    console.log('users', users);
  });

  socket.on('chat-message', msg => {
    msg['ts'] = Date.now() / 1000; // utc seconds
    io.emit('chat-message', msg); // send the message to everyone
  });

  socket.on('set-username', username => {
    username = username.trim();
    if (username.length < 1) {
      // TODO send back an error msg
      return;
    }
    if (Object.values(users).indexOf(username) > -1) {
      // name taken
      // TODO send back an error msg
    } else {
      users[socket.id] = username;
      socket.emit('set-username', username); // tell client its name
    }
  });
});

http.listen(4000, () => {
  console.log('listening on port 4000');
});
