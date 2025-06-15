import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('https://family-chatbot.fly.dev/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      const botMessage = { role: 'bot', content: data.response };
      setTimeout(() => setMessages(prev => [...prev, botMessage]), 700);
    } catch {
      setTimeout(() =>
        setMessages(prev => [...prev, { role: 'bot', content: 'Oops! Something went wrong.' }]), 700);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Ghar Ki Baat</h1>
        <div className="tagline">
          Recipes, Rituals aur Rishtey — Ghar ke har pehlu ki baat. ❤️
        </div>
      </header>

      <div className="chatbox" role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role}`}
            style={{ animation: 'fadeInUp 0.5s ease forwards', animationDelay: `${idx * 0.1}s` }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          aria-label="Type your message"
          placeholder="Ask anything about food or festivals..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          autoComplete="off"
          spellCheck="false"
        />
        <button aria-label="Send message" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
