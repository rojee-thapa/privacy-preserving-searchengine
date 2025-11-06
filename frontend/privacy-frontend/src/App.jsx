// src/App.jsx
import React, { useState } from 'react';
import './App.css';

const categoriesList = [
  { key: 'general', label: 'General', icon: '🔍' },
  { key: 'news', label: 'News', icon: '📰' },
  { key: 'science', label: 'Research', icon: '🔬' },
  { key: 'technology', label: 'Tech', icon: '💻' },
  { key: 'images', label: 'Images', icon: '🖼️' },
];

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('general');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [settings, setSettings] = useState({
    language: 'en',
    country: 'us',
    darkMode: false,
    numResults: 5
  });

  // Apply settings and close modal
  const applySettings = () => {
    setSettingsOpen(false);
  };

  // Toggle dark mode class on body
  React.useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);

  const handleSearch = async (category = activeCategory) => {
    if (!query.trim()) return;

    try {
      let url = `http://localhost:8000/search?q=${query}&category=${category}&language=${settings.language}&num_results=${settings.numResults}`;

      const response = await fetch(url);
      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);
      setActiveCategory(category);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    const messageToSend = chatInput;
    setChatInput('');

    try {
      const response = await fetch(`http://localhost:8000/chat?num_results=${settings.numResults}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      const botMessage = { role: 'bot', content: data.reply };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with chatbot:', error);
    }
  };

  return (
    <div className={`App ${settings.darkMode ? 'dark-mode' : ''}`}>
      <header>
        <h1>Privacy Search</h1>
        <button onClick={() => setSettingsOpen(true)}>Settings ⚙️</button>
      </header>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={() => handleSearch()}>Search</button>
      </div>

      {/* Category buttons */}
      <div className="category-bar">
        {categoriesList.map((cat) => (
          <button
            key={cat.key}
            className={`category-button ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => handleSearch(cat.key)}
          >
            <span className="cat-icon">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div className="results-section">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="result-card">
              {result.image && activeCategory === 'images' && (
                <img src={result.image} alt={result.title} />
              )}
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                <h3>{result.title}</h3>
              </a>
              <p>{result.content}</p>
            </div>
          ))
        ) : (
          query && <p>No results found.</p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="summary-section">
          <h2>Summary:</h2>
          <p>{summary}</p>
        </div>
      )}

      {/* Chatbot */}
      <div className="chat-section">
        <h2>Chatbot</h2>
        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={msg.role === 'user' ? 'chat-user' : 'chat-bot'}
              >
                <strong>{msg.role === 'user' ? 'You: ' : 'Bot: '}</strong>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            />
            <button onClick={handleChat}>Send</button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="settings-modal">
          <h2>Settings</h2>

          <div className="setting-item">
            <label>Language:</label>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Country:</label>
            <select
              value={settings.country}
              onChange={(e) =>
                setSettings({ ...settings, country: e.target.value })
              }
            >
              <option value="us">United States</option>
              <option value="gb">United Kingdom</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
              <option value="cn">China</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Dark Mode:</label>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) =>
                setSettings({ ...settings, darkMode: e.target.checked })
              }
            />
          </div>

          <div className="setting-item">
            <label>Number of results:</label>
            <select
              value={settings.numResults}
              onChange={(e) =>
                setSettings({ ...settings, numResults: Number(e.target.value) })
              }
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <button onClick={applySettings}>Apply ✅</button>
        </div>
      )}
    </div>
  );
}

export default App;
