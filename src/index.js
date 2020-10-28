import React from 'react';
import ReactDOM from 'react-dom';
import openSocket from 'socket.io-client';
import App from './App';

const socket = openSocket('http://localhost:4000');

ReactDOM.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
  document.getElementById('root')
);
