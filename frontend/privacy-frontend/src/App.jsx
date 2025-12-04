// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const categoriesList = [
  { key: 'general', label: 'General', icon: '🔍' },
  { key: 'news', label: 'News', icon: '📰' },
  { key: 'science', label: 'Research', icon: '🔬' },
  { key: 'technology', label: 'Tech', icon: '💻' },
];

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const [activeCategory, setActiveCategory] = useState('general');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const [settings, setSettings] = useState({
    language: 'en',
    darkMode: false,
    numResults: 5,
  });

  const applySettings = () => {
    setSettingsOpen(false);
  };

  // Dark mode toggle
  useEffect(() => {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }, [settings.darkMode]);

  // Auto-scroll chat
  useEffect(() => {
    const box = document.querySelector('.chat-messages');
    if (box) box.scrollTop = box.scrollHeight;
  }, [chatMessages]);

  // --- SEARCH ---
  const handleSearch = async (category = activeCategory) => {
    if (!query.trim()) return;

    setLoadingSearch(true);
    setSummaryOpen(false);

    try {
      const url = `http://127.0.0.1:8000/search?q=${query}&category=${category}&language=${settings.language}&num_results=${settings.numResults}`;
      const response = await fetch(url);
      const data = await response.json();

      setResults(data.results);
      setSummary(data.summary);
      setActiveCategory(category);
    } catch (error) {
      console.error('Search error:', error);
    }

    setLoadingSearch(false);
  };

  // --- CHAT ---
  const handleChat = async () => {
    if (!chatInput.trim()) return;

    // Add user message locally
    const userMessage = { role: 'user', content: chatInput };
    const newMessages = [...chatMessages, userMessage].slice(-10); // Keep last 10 messages
    setChatMessages(newMessages);

    const messageToSend = chatInput;
    setChatInput('');
    setLoadingChat(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/chat?num_results=${settings.numResults}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }), // send last 10 messages
        }
      );

      const data = await response.json();
      const botMessage = { role: 'assistant', content: data.reply };
      setChatMessages(prev => [...prev, botMessage].slice(-10)); // Keep last 10
    } catch (error) {
      console.error('Chat error:', error);
    }

    setLoadingChat(false);
  };

  return (
    <div className={`App ${settings.darkMode ? 'dark-mode' : ''}`}>
      <header>
        <div>
          <h1>Privacy Search</h1>
          <p className="subtitle">A Privacy-Preserving, AI-Enhanced Metasearch Engine</p>
        </div>
        <button onClick={() => setSettingsOpen(true)}>Settings ⚙️</button>
      </header>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web..."
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={() => handleSearch()}>Search</button>
      </div>

      {/* Categories */}
      <div className="category-bar">
        {categoriesList.map(cat => (
          <button
            key={cat.key}
            className={`category-button ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => handleSearch(cat.key)}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loadingSearch && <p className="loading">🔄 Searching…</p>}

      {/* Results */}
      <div className="results-section">
        {results.length > 0 && !loadingSearch ? (
          results.map((result, index) => (
            <div key={index} className="result-card">
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                <h3>{result.title}</h3>
              </a>
              <p>{result.content}</p>
            </div>
          ))
        ) : (
          query && !loadingSearch && <p>No results found.</p>
        )}
      </div>

      {/* Summary Toggle */}
      {summary && (
        <div className="summary-section">
          <button
            className="summary-toggle"
            onClick={() => setSummaryOpen(prev => !prev)}
          >
            {summaryOpen ? '▼ Hide Summary' : '► Show Summary'}
          </button>

          {summaryOpen && (
            <div className="summary-box">
              <p>{summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Chatbot */}
      <div className="chat-section">
        <h2>Chatbot</h2>

        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? 'chat-user' : 'chat-bot'}>
                <strong>{msg.role === 'user' ? 'You:' : 'Bot:'}</strong> {msg.content}
              </div>
            ))}

            {loadingChat && (
              <div className="chat-bot">
                <strong>Bot:</strong> 💬 Thinking…
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
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
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Dark Mode:</label>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
            />
          </div>

          <div className="setting-item">
            <label>Number of results:</label>
            <select
              value={settings.numResults}
              onChange={(e) => setSettings({ ...settings, numResults: Number(e.target.value) })}
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

      {/* How It Works */}
      <footer className="footer">
        <p><strong>How It Works:</strong> Queries → SearXNG → Tor → Privacy Filters → AI Summary</p>
      </footer>
    </div>
  );
}

export default App;
