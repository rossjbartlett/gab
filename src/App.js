import React, { useEffect, useState } from 'react';
import './App.css';

const TIMESTAMP_OPTIONS = { hour: '2-digit', minute: '2-digit', hour12: false };

const EMOJIS = {
  ':)': '🙂 ',
  ';)': '😉 ',
  ':(': '🙁 ',
  ':o': '😲 ',
};

function emojify(text) {
  for (const [trigger, emoji] of Object.entries(EMOJIS)) {
    text = text.replace(trigger, emoji);
  }
  return text;
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

function Message({ m, username }) {
  function renderTime(ts) {
    const d = new Date(0);
    d.setUTCSeconds(ts);
    return d.toLocaleTimeString('en-US', TIMESTAMP_OPTIONS);
  }

  const isSelf = m.username === username;
  const fontWeight = isSelf ? 'bold' : '500';
  const msgStyle = {
    background: isSelf ? 'dodgerblue' : '#eee',
    color: isSelf ? 'white' : 'black',
  };

  return (
    <div
      className='msgContainer'
      style={{
        justifyContent: isSelf ? 'flex-end' : 'flex-start',
      }}
    >
      <li
        style={{
          alignItems: isSelf ? 'flex-end' : 'flex-start',
        }}
      >
        <div className='details'>
          <span className='timestamp'>{renderTime(m.ts)}</span>
          <span className='username' style={{ color: m.color, fontWeight }}>
            {m.username}
          </span>
        </div>
        <div className='msg' style={msgStyle}>
          {m.msg}
        </div>
      </li>
    </div>
  );
}

function App({ socket }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [self, setSelf] = useState({});
  const [err, setErr] = useState();

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
    socket.on('error-msg', function (err) {
      setErr(err);
      setTimeout(() => setErr(null), 3000);
    });
    socket.on('set-users', function (users) {
      setUsers(Object.values(users));
      setSelf(users[socket.id]);
    });
  }, [socket]);

  useEffect(() => {
    // update username cookie
    if (self.username) {
      document.cookie = `username=${self.username};max-age=${
        60 * 60 * 24 * 100
      }`;
    }
  }, [self]);

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
                <Message key={i} m={m} username={self.username} />
              ))}
            </ul>
          </div>
          <Userlist userList={userList} self={self} />
          <div className={`err ${err ? 'show' : ''}`}>{err}</div>
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
