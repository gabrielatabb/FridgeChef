import React, { useState } from 'react';

const RecipeChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me for a recipe with your saved ingredients.' }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    // Show user message
    setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
    setUserInput('');

    try {
      const response = await fetch('http://localhost:8000/generate_recipe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
      });

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.recipe || data.detail }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>FridgeChef Chat</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'FridgeChef'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder="Ask for a recipe..."
        style={{ width: '80%', padding: '10px' }}
      />
      <button onClick={handleSend} style={{ width: '18%', padding: '10px' }}>Send</button>
    </div>
  );
};

export default RecipeChat;
