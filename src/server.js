const app = require('express')();
const http = require('http').createServer(app);
const parser = require('socket.io-json-parser');
const io = require('socket.io')(http, { parser });
const rug = require('random-username-generator');

const COLORS = [
  'red',
  'darkred',
  'blue',
  'darkblue',
  'purple',
  'magenta',
  'green',
  'darkgreen',
  'blueviolet',
  'chocolate',
  'darkslategrey',
  'goldenrod',
];

function randColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const users = {};
const usernames = new Set();

io.on('connection', socket => {
  console.log('a user connected');
  const initialUsername = rug.generate();
  users[socket.id] = { username: initialUsername, color: randColor() };
  usernames.add(initialUsername);
  socket.emit('set-username', initialUsername); // tell client its name

  io.emit('set-users', users); // tell everyone the user list

  socket.on('disconnect', () => {
    console.log('user disconnected');
    usernames.delete(users[socket.id].username);
    delete users[socket.id];
    io.emit('set-users', users); // tell everyone the user list
  });

  socket.on('chat-message', msg => {
    msg['ts'] = Date.now() / 1000; // utc seconds
    io.emit('chat-message', msg); // send the message to everyone
  });

  socket.on('set-username', username => {
    username = username.trim();
    if (username.length < 1) {
      socket.emit('chat-message', 'Error: invalid username');
      return;
    }
    if (usernames.has(username)) {
      socket.emit('chat-message', 'Error: username is taken');
    } else {
      users[socket.id].username = username;
      usernames.delete(username);
      usernames.add(username);
      io.emit('set-users', users); //notify all
    }
  });

  socket.on('set-color', color => {
    color = color.trim();
    if (color[0] !== '#') {
      color = '#' + color;
    }
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      // is valid hex color
      users[socket.id].color = color;
      io.emit('set-users', users); //notify all
    } else {
      socket.emit('chat-message', 'Error: invalid color');
    }
  });
});

http.listen(4000, () => {
  console.log('listening on port 4000');
});
