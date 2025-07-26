import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const aliases = {
  "karwa chauth": "karwa_chauth",
  "karwa chauth pooja": "karwa_chauth",
  "karwachauth": "karwa_chauth",
  "karva chauth": "karwa_chauth",
  "karwachauth pooja": "karwa_chauth",

  "teej": "teej_pooja",
  "teej pooja": "teej_pooja",
  "hariyali teej": "teej_pooja",
  "teej vrat": "teej_pooja",
  "teej ritual": "teej_pooja",

  "gowardhan pooja": "gowardhan_pooja",
  "govardhan pooja": "gowardhan_pooja",

  "kaddu": "pumpkin_recipe",
  "pumpkin": "pumpkin_recipe",
  "pumpkin recipe": "pumpkin_recipe",
  "kaddu recipe": "pumpkin_recipe",

  "karela": "bittergourd_recipe",
  "bittergourd": "bittergourd_recipe",
  "bitter gourd": "bittergourd_recipe",
  "karela recipe": "bittergourd_recipe",
  "bittergourd recipe": "bittergourd_recipe",
  "kaarela": "bittergourd_recipe",

  "dum aloo": "kashmiri_dum_aloo",
  "duma aloo": "kashmiri_dum_aloo",
  "kashmiri dum aloo": "kashmiri_dum_aloo",
  "kashmiri dumalu": "kashmiri_dum_aloo",

  "urad dal poori": "urad_dal_poori",
  "udad dal poori": "urad_dal_poori",
  "urad dal puri": "urad_dal_poori",
  "udad dal puri": "urad_dal_poori",
  "poori": "urad_dal_poori",
  "puri": "urad_dal_poori",
  "urad": "urad_dal_poori",

  "haak": "haak",
  "haak recipe": "haak",
  "hak": "haak",
  "kashmiri haak": "haak",
  "kashmiri hak": "haak",

  "fried rice": "fried_rice",
  "friend rice": "fried_rice",

  "food": "food_general",
  "food recipe": "food_general",
  "recipes": "food_general"
};

const vaishPoojaKeys = ['karwa_chauth', 'teej_pooja', 'gowardhan_pooja'];
const vaishSatvikCategory = 'satvik_recipes';

// list of known Kashmiri dish keys
const kashmiriRecipeKeys = [
  "kashmiri_dishes",
  "kashmiri_dum_aloo",
  "haak",
  // add other Kashmiri recipe keys here as needed
];

const defaultLoadingMsg = "Bringing mummy's best ideas for you... आपके लिए मम्मी के बेहतरीन विचार ला रहे हैं।";

const getFamilyMessages = (key) => {
  if (vaishPoojaKeys.includes(key)) {
    return {
      familyMsg: 'You are getting a Vaish family ritual.',
      loadingMsg: 'Bringing Vaish family ritual for you... वैष परिवार की पूजा आपके लिए ला रहे हैं...',
    };
  }
  if (key === vaishSatvikCategory) {
    return {
      familyMsg: 'You are getting a Vaish family recipe.',
      loadingMsg: 'Bringing Vaish family recipe for you... वैष परिवार की रेसिपी आपके लिए ला रहे हैं...',
    };
  }
  if (kashmiriRecipeKeys.includes(key) || key.startsWith('kashmiri_')) {
    return {
      familyMsg: 'You are getting a Bhat family recipe.',
      loadingMsg: 'Bringing Bhat family recipe for you... भट्ट परिवार की रेसिपी आपके लिए ला रहे हैं...',
    };
  }
  // For all other keys, show a friendly generic message
  return {
    familyMsg: "Here's something I found based on your question.",
    loadingMsg: "Finding the best info for you...",
  };
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSuggestedKeyword, setLastSuggestedKeyword] = useState(null);
  const [familyRecipeMessage, setFamilyRecipeMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(defaultLoadingMsg);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, loading]);

  const sendMessage = async (customMessage = null) => {
    let messageToSend = (customMessage || input).trim().toLowerCase();

    if (aliases[messageToSend]) {
      messageToSend = aliases[messageToSend];
    }
    if (!messageToSend) return;

    const { familyMsg, loadingMsg } = getFamilyMessages(messageToSend);
    setFamilyRecipeMessage(familyMsg);
    setLoadingMessage(loadingMsg);

    setMessages(prev => [...prev, { role: 'user', content: customMessage || input.trim() }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://family-chatbot.onrender.com/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      setLastSuggestedKeyword(data.suggested_keyword);

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
        setLoading(false);
        setFamilyRecipeMessage('');   // Clear message here
      }, 700);
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: 'Oops! Something went wrong.' }]);
        setLoading(false);
        setFamilyRecipeMessage('');
        setLoadingMessage(defaultLoadingMsg);
      }, 700);
    }
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
    setFamilyRecipeMessage('');
    setLoadingMessage(defaultLoadingMsg);
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

        {familyRecipeMessage && (
          <div
            className="family-message"
            style={{ fontWeight: 'bold', color: '#2c7a7b', marginBottom: 8 }}
            aria-live="polite"
          >
            {familyRecipeMessage}
          </div>
        )}

        {loading && (
          <div className="message bot loading">
            <span className="spinner" aria-label="Loading"></span>
            {loadingMessage}
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
          onKeyPress={e => e.key === 'Enter' && handleUserInput()}
          autoComplete="off"
          spellCheck="false"
        />
        <button aria-label="Send message" onClick={handleUserInput}>
          Send
        </button>
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
