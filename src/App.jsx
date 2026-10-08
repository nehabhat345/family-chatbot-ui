import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './FormattedMessage.css';
import './ChatPrompts.css';

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
const starterPrompts = [
  'Pumpkin recipe',
  'Kashmiri haak',
  'Karwa Chauth pooja',
];
const followUpPrompts = ['Teej pooja', 'Urad dal poori', 'Kashmiri haak'];
const surprisePrompts = [
  'Pumpkin recipe',
  'Karela recipe',
  'Urad dal poori',
  'Aloo jeera',
  'Lauki sabzi',
  'Nimbu rice',
  'Kashmiri haak',
  'Chokh Wangun',
  'Nadru Yakhni',
  'Palak paneer',
  'Fried rice',
  'Avocado toast',
  'Masala chai',
  'Karwa Chauth pooja',
  'Teej pooja',
  'Govardhan pooja',
  'Navratri vrat',
  'Sakat Chauth pooja',
];

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

const renderBotMessage = (content) => {
  if (typeof content !== 'string') return content ?? '';

  const blocks = [];
  let currentSection = null;
  let listType = null;
  let listItems = [];
  let blockKey = 0;
  const pushBlock = (block) => {
    if (currentSection) currentSection.blocks.push(block);
    else blocks.push(block);
  };
  const flushList = () => {
    if (!listItems.length) return;
    const List = listType === 'numbered' ? 'ol' : 'ul';
    pushBlock(
      <List key={`list-${blockKey++}`}>
        {listItems.map((item, index) => <li key={index}>{item}</li>)}
      </List>
    );
    listItems = [];
    listType = null;
  };

  content.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      flushList();
      return;
    }

    const listMatch = trimmedLine.match(/^(?:[-*]\s+|\d+[.)]\s+)/);
    if (listMatch) {
      const nextListType = /^\d/.test(trimmedLine) ? 'numbered' : 'bulleted';
      if (listType && listType !== nextListType) flushList();
      listType = nextListType;
      listItems.push(trimmedLine.slice(listMatch[0].length));
      return;
    }

    flushList();
    const titleMatch = trimmedLine.match(/^\*\*(.+)\*\*$/);
    if (titleMatch) {
      pushBlock(<h3 key={`title-${blockKey++}`}>{titleMatch[1]}</h3>);
    } else if (/^(Ingredients|Method|Details|Tip):$/i.test(trimmedLine)) {
      currentSection = {
        kind: 'section',
        key: `section-${blockKey++}`,
        title: trimmedLine.slice(0, -1),
        blocks: [],
      };
      blocks.push(currentSection);
    } else {
      pushBlock(<p key={`paragraph-${blockKey++}`}>{trimmedLine}</p>);
    }
  });
  flushList();

  return (
    <div className="formatted-message">
      {blocks.map((block) => block.kind === 'section' ? (
        <details key={block.key} className="recipe-section">
          <summary>{block.title}</summary>
          <div className="recipe-section-content">{block.blocks}</div>
        </details>
      ) : block)}
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Namaste! I'm Nehu. Ask me about a family recipe or pooja ritual." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSuggestedKeyword, setLastSuggestedKeyword] = useState(null);
  const [familyRecipeMessage, setFamilyRecipeMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(defaultLoadingMsg);
  const messagesEndRef = useRef(null);
  const recentSurprisePrompts = useRef([]);
  const hasUserMessages = messages.some(message => message.role === 'user');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getSurprisePrompt = () => {
    let availablePrompts = surprisePrompts.filter(
      prompt => !recentSurprisePrompts.current.includes(prompt)
    );
    if (!availablePrompts.length) {
      recentSurprisePrompts.current = [];
      availablePrompts = surprisePrompts;
    }

    const prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    recentSurprisePrompts.current = [...recentSurprisePrompts.current, prompt].slice(-5);
    return prompt;
  };

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
            {msg.role === 'bot' ? renderBotMessage(msg.content) : msg.content}
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

        {!loading && (
          <div className="chat-prompts" aria-label="Suggested messages">
            <p className="chat-prompts-title">
              {hasUserMessages ? 'Keep the chat going' : 'Pick something to explore'}
            </p>
            <div className="chat-prompt-list">
              {(hasUserMessages ? followUpPrompts : starterPrompts).map(prompt => (
                <button
                  key={prompt}
                  className="chat-prompt"
                  type="button"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
              <button
                className="chat-prompt surprise-prompt"
                type="button"
                onClick={() => sendMessage(getSurprisePrompt())}
              >
                ✨ Surprise me
              </button>
            </div>
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
