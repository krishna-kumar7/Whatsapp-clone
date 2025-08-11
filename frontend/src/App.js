import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { getChats, getMessages, sendMessage } from './api';
import { io } from 'socket.io-client';

function App() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatNumber, setNewChatNumber] = useState('');
  const socketRef = useRef(null);

  // Fetch chats on mount
  useEffect(() => {
    setLoadingChats(true);
    getChats()
      .then(data => {
        setChats(data);
        if (data.length > 0) setSelectedChat(data[0]._id);
        setLoadingChats(false);
      })
      .catch(err => {
        setError('Failed to load chats');
        setLoadingChats(false);
      });
  }, []);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;
    setLoadingMessages(true);
    getMessages(selectedChat)
      .then(data => {
        setMessages(data);
        setLoadingMessages(false);
      })
      .catch(err => {
        setError('Failed to load messages');
        setLoadingMessages(false);
      });
  }, [selectedChat]);

  // Socket.IO real-time updates
  useEffect(() => {
    const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('new_message', (msg) => {
      if (msg.wa_id === selectedChat) {
        setMessages(prev => [...prev, msg]);
      }
      setChats(prev => prev.map(c => c._id === msg.wa_id ? { ...c, lastMessage: msg.message, lastTimestamp: msg.timestamp } : c));
    });
    socket.on('status_update', (msg) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: msg.status } : m));
    });
    return () => {
      socket.disconnect();
    };
  }, [selectedChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;
    const chat = chats.find(c => c._id === selectedChat);
    try {
      const newMsg = await sendMessage(selectedChat, {
        name: chat?.name || '',
        number: chat?.number || '',
        message: input,
      });
      setMessages(prev => [...prev, newMsg]);
      setInput('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleNewChat = async (e) => {
    e.preventDefault();
    if (!newChatName.trim() || !newChatNumber.trim()) return;
    // Simulate wa_id as number (or use a hash in real app)
    const wa_id = newChatNumber.replace(/\D/g, '');
    // Send a welcome message to create the chat in backend
    try {
      const newMsg = await sendMessage(wa_id, {
        name: newChatName,
        number: newChatNumber,
        message: 'Hi! This is the start of your chat.',
      });
      // Refetch chats
      const data = await getChats();
      setChats(data);
      setSelectedChat(wa_id);
      setShowNewChat(false);
      setNewChatName('');
      setNewChatNumber('');
    } catch (err) {
      setError('Failed to create new chat');
    }
  };

  const chat = chats.find(c => c._id === selectedChat);

  const handleAudioCall = () => {
    alert('Audio call feature coming soon!');
  };
  const handleVideoCall = () => {
    alert('Video call feature coming soon!');
  };

  return (
    <div className="wa-container">
      <aside className="wa-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem 0.5rem 1rem' }}>
          <h2 style={{ margin: 0 }}>Chats</h2>
          <button className="wa-newchat-btn" onClick={() => setShowNewChat(true)} title="New Chat">＋</button>
        </div>
        {loadingChats ? (
          <div style={{ color: '#fff', padding: '1rem' }}>Loading...</div>
        ) : (
          <ul>
            {chats.map(c => (
              <li
                key={c._id}
                className={selectedChat === c._id ? 'active' : ''}
                onClick={() => setSelectedChat(c._id)}
              >
                <div className="wa-chat-name">{c.name}</div>
                <div className="wa-chat-last">{c.lastMessage}</div>
              </li>
            ))}
          </ul>
        )}
        {showNewChat && (
          <div className="wa-modal-bg">
            <div className="wa-modal">
              <h3>New Chat</h3>
              <form onSubmit={handleNewChat}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Number"
                  value={newChatNumber}
                  onChange={e => setNewChatNumber(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.5em', marginTop: '1em' }}>
                  <button type="submit">Create</button>
                  <button type="button" onClick={() => setShowNewChat(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </aside>
      <main className="wa-main">
        <header className="wa-chat-header">
          {chat ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>{chat.name}</strong> <span className="wa-chat-number">{chat.number}</span>
              </div>
              <div style={{ display: 'flex', gap: '1em' }}>
                <button className="wa-call-btn" onClick={handleAudioCall} title="Audio Call">🔊</button>
                <button className="wa-call-btn" onClick={handleVideoCall} title="Video Call">🎥</button>
              </div>
            </div>
          ) : (
            <div>Select a chat</div>
          )}
        </header>
        <div className="wa-messages">
          {loadingMessages ? (
            <div>Loading messages...</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`wa-message-bubble ${msg.wa_id === selectedChat && !msg.fromMe ? 'from-them' : 'from-me'}`}
              >
                <span>{msg.message}</span>
                <div className="wa-message-meta">
                  <span>{msg.status}</span> | <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {chat && (
          <form className="wa-send-box" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message"
            />
            <button type="submit">Send</button>
          </form>
        )}
        {error && <div style={{ color: 'red', padding: '0.5rem' }}>{error}</div>}
      </main>
    </div>
  );
}

export default App;
