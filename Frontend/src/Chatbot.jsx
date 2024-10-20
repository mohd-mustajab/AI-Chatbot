import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets/rb_3669.png'

function Chatbot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]); 
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
     
      setMessages((prevMessages) => [...prevMessages, { text: query, sender: 'user' }]);

      const res = await axios.post('http://localhost:5000/api/dialogflow', {
        query,
        sessionId,
      });

      
      setMessages((prevMessages) => [...prevMessages, { text: res.data.fulfillmentText, sender: 'bot' }]);
      setSessionId(res.data.sessionId); 
      setQuery('');
    } catch (err) {
      console.error('Error sending query:', err);
      setMessages((prevMessages) => [...prevMessages, { text: 'Error communicating with Dialogflow', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
          <div className="header">
          <div className="logo">
            <img src={logo} alt=""/>
          </div>
          <div className="name">Travel Chatbot</div>
          </div>
        {messages.length > 0 ? (
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-messages"><h1>
            Ask anything......</h1>
            <p>Book a ticket from Delhi to Mumbai</p>
            <p>Fair of train from Mumbai to Hyderabad</p>
            <p>Next Train to Hyderabad</p>
            </div>
        )}
      </div>
      
      {/* Input box at the bottom */}
      <form className="input-box" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Start with Hello"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
