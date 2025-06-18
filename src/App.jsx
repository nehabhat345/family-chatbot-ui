import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSuggestedKeyword, setLastSuggestedKeyword] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend) return;

    const userMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://family-chatbot.onrender.com/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      const botMessage = { role: 'bot', content: data.response };
      setLastSuggestedKeyword(data.suggested_keyword || null);

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
      }, 700);
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: 'Oops! Something went wrong.' }]);
        setLoading(false);
      }, 700);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleUserInput();
  };

  const handleUserInput = () => {
    const trimmedInput = input.trim().toLowerCase();
    if (lastSuggestedKeyword && ['yes', 'haan', 'haanji', 'ha'].includes(trimmedInput)) {
      sendMessage(lastSuggestedKeyword);
      setLastSuggestedKeyword(null);
    } else {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    setLastSuggestedKeyword(null);
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

        {loading && (
          <div className="message bot loading">
            <span className="spinner" aria-label="Loading"></span>
            Bringing mummy's best ideas for you... आपके लिए मम्मी के बेहतरीन विचार ला रहे हैं।
          </div>
        )}

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
        <button aria-label="Send message" onClick={handleUserInput}>Send</button>
        <button
          className="clear-chat-button"
          onClick={clearChat}
          title="Clear Chat"
          aria-label="Clear Chat"
        >
          🧹
        </button>
      </div>
    </div>
  );
};

export default App;
