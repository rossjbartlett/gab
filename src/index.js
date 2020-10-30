import React from 'react';
import ReactDOM from 'react-dom';
import openSocket from 'socket.io-client';
import App from './App';
const parser = require('socket.io-json-parser');

const socket = openSocket('http://localhost:4000', { parser });

function initClient() {
  let cookieUsername;
  try {
    cookieUsername = document.cookie
      .split('; ')
      .find(row => row.startsWith('username'))
      .split('=')[1];
  } catch {}
  socket.emit('init-client', cookieUsername);
}

socket.on('connect', initClient);
socket.on('reconnect', initClient);

ReactDOM.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
  document.getElementById('root')
);
