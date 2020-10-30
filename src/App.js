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

function Userlist({ userList, self }) {
  return (
    <div id='userlist'>
      <div>Online ({userList.length})</div>
      {userList.map((u, i) => {
        const isSelf = u.username === self.username;
        return (
          <p
            key={i}
            style={{
              color: u.color,
              fontWeight: isSelf ? 'bold' : '',
            }}
          >
            {u.username + (isSelf ? ' (You)' : '')}
          </p>
        );
      })}
    </div>
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

  useEffect(() => {
    socket.on('messages', function (msgs) {
      setMessages(msgs);
    });
    socket.on('error-msg', function (errMsg) {
      setMessages(msgs => msgs.concat[errMsg]); // TODO popup instead
    });
    socket.on('set-users', function (users) {
      setUsers(Object.values(users));
      setSelf(users[socket.id]);
    });
  }, [socket]);

  useEffect(() => {
    // when msgs change, scroll to bottom
    const elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
  }, [messages]);

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
              {messages.map((m, i) => (
                <Message key={i} m={m} socketId={socket.id} />
              ))}
            </ul>
          </div>
          <Userlist userList={userList} self={self} />
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
