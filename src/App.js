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

function ErrorMessage({ m }) {
  return (
    <li>
      <span className='err'>{m}</span>
    </li>
  );
}

function Message({ m, socketId }) {
  function renderTime(ts) {
    const d = new Date(0);
    d.setUTCSeconds(ts);
    return d.toLocaleTimeString('en-US', TIMESTAMP_OPTIONS);
  }

  return typeof m === 'string' ? (
    <ErrorMessage m={m} />
  ) : (
    <li
      style={{
        fontWeight: m.userId === socketId ? 'bold' : '',
      }}
    >
      <span className='timestamp'>{renderTime(m.ts)}</span>
      <span className='username' style={{ color: m.color }}>
        {m.username}
      </span>
      <span className='msg'>{m.msg}</span>
    </li>
  );
}

function App({ socket }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [self, setSelf] = useState({});

  function createMessage(msg) {
    return {
      userId: socket.id,
      username: self.username,
      color: self.color,
      msg,
    };
  }

  function getUpdatedMessages(messages, users) {
    // make copy of messages with updated colors, usernames
    const msgs = messages.map(m => {
      if (m.userId in users) {
        // if user is still active, get their latest name/color
        m.username = users[m.userId].username;
        m.color = users[m.userId].color;
      }
      //if user is not active, maintain the last name/color set on the msg
      return m;
    });
    return msgs;
  }

  useEffect(() => {
    socket.on('chat-message', function (msg) {
      setMessages(msgs => msgs.concat([msg]));
      const elem = document.getElementById('messages');
      elem.scrollTop = elem.scrollHeight;
    });
    socket.on('set-users', function (users) {
      setUsers(Object.values(users));
      setSelf(users[socket.id]);
      setMessages(msgs => getUpdatedMessages(msgs, users));
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

  const userList = users.filter(item => item !== self);
  userList.unshift(self); // put self user at top

  return (
    <div id='app'>
      <div id='chat'>
        <div id='title'>gab.</div>
        <div id='body'>
          <div id='messagesContainer'>
            <ul id='messages'>
              <li>
                You are{' '}
                <span className='username' style={{ color: self?.color }}>
                  <b>{self?.username}</b>
                </span>
                .
              </li>
              {messages.map(m => (
                <Message key={m.ts} m={m} socketId={socket.id} />
              ))}
            </ul>
          </div>
          <div id='userlist'>
            Online ({userList.length})
            {userList.map((u, i) => (
              <p
                key={i}
                style={{
                  color: u.color,
                  fontWeight: u.username === self.username ? 'bold' : '',
                }}
              >
                {u.username}
              </p>
            ))}
          </div>
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
