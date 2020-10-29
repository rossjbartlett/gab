import React, { useEffect, useState } from 'react';
import './App.css';

const TIMESTAMP_OPTIONS = { hour: '2-digit', minute: '2-digit', hour12: false };

const EMOJIS = [
  { emoji: '🙂', trigger: ':)' },
  { emoji: '😉', trigger: ';)' },
  { emoji: '🙁', trigger: ':(' },
  { emoji: '😲', trigger: ':o' },
];

function emojify(text) {
  for (const e of EMOJIS) {
    text = text.replace(e.trigger, e.emoji);
  }
  return text;
}

function App({ socket }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [self, setSelf] = useState({});

  function createMessage(msg) {
    return {
      userId: socket.id,
      msg,
    };
  }

  useEffect(() => {
    socket.on('chat-message', function (msg) {
      setMessages(msgs => msgs.concat([msg]));
    });
    socket.on('set-users', function (users) {
      setUsers(users);
      console.log('self', users[socket.id]);
      setSelf(users[socket.id]);
      console.log('users', users);
    });
  }, [socket]);

  function handleSend(e) {
    e.preventDefault(); // prevent refresh
    if (text.trim()) {
      if (text.startsWith('/name ')) {
        socket.emit('set-username', text.replace('/name ', ''));
      } else if (text.startsWith('/color ')) {
        socket.emit('set-color', text.replace('/color ', ''));
      } else {
        socket.emit('chat-message', createMessage(text));
      }
    }
    setText('');
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
              <span className='username' style={{ color: self?.color }}>
                <b>{self?.username}</b>
              </span>
              .
            </li>
            {messages.map(m => (
              <li
                key={m.ts}
                style={{
                  fontWeight: m.userId === socket.id ? 'bold' : '',
                }}
              >
                <span className='timestamp'>{renderTime(m.ts)}</span>
                <span
                  className='username'
                  style={{ color: users[m.userId]?.color || 'black' }}
                >
                  {users[m.userId]?.username}:
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
            onChange={e => setText(emojify(e.target.value))}
            autoComplete='off'
          />
          <button>Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
