const app = require('express')();
const http = require('http').createServer(app);
const parser = require('socket.io-json-parser');
const io = require('socket.io')(http, { parser });
const rug = require('random-username-generator');
const toHex = require('colornames');

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
const usernames = () => Object.values(users).map(u => u.username);
const messages = [];

io.on('connection', socket => {
  let lastColor;

  socket.on('init-client', username => {
    if (usernames().indexOf(username) >= 0) {
      // username taken
      username = rug.generate();
    } else {
      // preserve color if user in chat history
      const m = messages.find(m => m.username === username);
      if (m) {
        lastColor = m.color;
      }
    }
    users[socket.id] = { username, color: lastColor || randColor() };
    io.emit('set-users', users); // tell everyone the user list, also gives current client its name
    socket.emit('messages', messages); // give client the message history
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('set-users', users);
  });

  socket.on('chat-message', msg => {
    msg['ts'] = Date.now() / 1000; // utc seconds
    messages.push(msg);
    if (messages.length > 200) {
      messages.shift(); // pop oldest msg
    }
    io.emit('messages', messages);
  });

  socket.on('set-username', username => {
    username = username.trim();
    if (username.length < 1) {
      socket.emit('error-msg', 'Error: invalid username');
      return;
    }
    if (usernames().indexOf(username) >= 0) {
      socket.emit('error-msg', 'Error: username is taken');
    } else {
      users[socket.id].username = username;
      const usersMsgs = messages.filter(m => m.userId === socket.id);
      usersMsgs.forEach(m => (m.username = username));
      io.emit('set-users', users); //notify all
      io.emit('messages', messages);
    }
  });

  socket.on('set-color', c => {
    let color = c.trim();
    if (color[0] !== '#') {
      color = '#' + color;
    }
    const isHex = /^#[0-9A-F]{6}$/i.test(color);
    if (!isHex) {
      color = toHex(c);
    }
    if (isHex || color) {
      users[socket.id].color = color;
      const usersMsgs = messages.filter(m => m.userId === socket.id);
      usersMsgs.forEach(m => (m.color = color));
      io.emit('set-users', users); //notify all
      io.emit('messages', messages);
    } else {
      socket.emit('error-msg', 'Error: invalid color');
    }
  });
});

http.listen(4000, () => {
  console.log('listening on port 4000');
});
