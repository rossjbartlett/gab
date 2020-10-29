import React, { useEffect, useState } from 'react';
import './App.css';

const rug = require('random-username-generator');

const TIMESTAMP_OPTIONS = { hour: '2-digit', minute: '2-digit', hour12: false };

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

function App({ socket }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(rug.generate());
  const [color, setColor] = useState(randColor());

  // show username somewhere

  function createMessage(msg) {
    return {
      user,
      msg,
      ts: Date.now() / 1000, // utc seconds
      c: color,
    };
  }

  useEffect(() => {
    socket.on('chat-message', function (msg) {
      setMessages(msgs => msgs.concat([msg]));
    });
  }, [socket]);

  function handleSend(e) {
    e.preventDefault(); // prevent refresh
    if (text.trim()) {
      socket.emit('chat-message', createMessage(text));
      setText('');
    }
  }

  function renderTime(ts) {
    const d = new Date(0);
    d.setUTCSeconds(ts);
    return d.toLocaleTimeString('en-US', TIMESTAMP_OPTIONS);
  }

  return (
    <div id='app'>
      <div id='chat'>
        <div id='messagesContainer'>
          <div id='title'>gab.</div>
          <ul id='messages'>
            <li>
              You are{' '}
              <span className='username' style={{ color }}>
                <b>{user}</b>
              </span>
              .
            </li>
            {messages.map(m => (
              <li
                key={m.ts}
                style={{ fontWeight: m.user === user ? 'bold' : '' }}
              >
                <span className='timestamp'>{renderTime(m.ts)}</span>
                <span className='username' style={{ color: m.c }}>
                  {m.user}:
                </span>
                <span className='msg'>{m.msg}</span>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleSend}>
          <input
            id='input'
            value={text}
            onChange={e => setText(e.target.value)}
            autoComplete='off'
          />
          <button>Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
