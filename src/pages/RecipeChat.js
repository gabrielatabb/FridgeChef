import React, { useState } from 'react';
import './RecipeChat.css';
import '../styles.css'

const RecipeChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Please enter a prompt - You can either ask for a recipe, or give me specifications on what you would like me to create based on your ingredients and preferences.' }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
    setUserInput('');

    try {
      const response = await fetch('http://localhost:8000/generate_recipe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
        body: JSON.stringify({ prompt: userInput }) // ✨ send the user message
      });
      

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.recipe || data.detail }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }
  };

  return (
    <div className="chat-layout">
    <div
  className="sideBar">
  <div
    className="outfit-font"
    style={{
      marginLeft: "20px",
      fontSize: "40px",
      color: "#EC6D53",
      textDecoration: "underline"
    }}
  >
    Your Items
  </div>
  <a href="http://localhost:3000/product" style={{ fontSize: "40px", marginLeft: "10px" }}>
    &gt;
  </a>
</div>


      <div className="chatbox">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender}`}
            >
              <strong>{msg.sender === 'user' ? 'You' : 'FridgeChef'}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            className="chat-input"
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Ask for a recipe..."
          />
          <button className="chat-button" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeChat;
