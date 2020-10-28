import React, { useEffect, useState } from 'react';
import './App.css';

function App({ socket }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('chat-message', function (msg) {
      setMessages(msgs => msgs.concat([msg]));
    });
  }, [socket]);

  function handleSend(e) {
    e.preventDefault(); // prevent refresh
    if (text.trim()) {
      socket.emit('chat-message', text);
      setText('');
    }
  }

  return (
    <div id='app'>
      <div id='chat'>
        <div id='messagesContainer'>
          <div id='title'>gab.</div>
          <ul id='messages'>
            <li>test msg</li>
            <li>test msg2</li>
            {messages.map(m => (
              <li>{m}</li>
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
