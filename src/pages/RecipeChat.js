import React, { useState, useEffect } from 'react';
import './RecipeChat.css';
import '../styles.css';

const RecipeChat = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! Please enter a prompt - You can either ask for a recipe, or give me specifications on what you would like me to create based on your ingredients and preferences.'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [latestRecipeGenerated, setLatestRecipeGenerated] = useState(false);
  const [ingredients, setIngredients] = useState([]);

  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:8000/get_ingredients/', {
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
      });
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error("Failed to fetch ingredients", error);
    }
  };

  const sendRecipeRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/generate_recipe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
        body: JSON.stringify({ prompt: userInput })
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.recipe || data.detail },
        { sender: 'bot', text: 'Would you like to accept this recipe and remove used ingredients from your list? (yes / no)' }
      ]);
      setLatestRecipeGenerated(true);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }
  };

  const handleUserReply = async (text) => {
    const lowerText = text.toLowerCase();
  
    if (latestRecipeGenerated && (lowerText === 'yes' || lowerText === 'no')) {
      if (lowerText === 'yes') {
        try {
          const response = await fetch('http://localhost:8000/accept_recipe/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(username + ':' + password),
            },
            body: JSON.stringify({ accept: true })
          });
  
          const data = await response.json();
          setLatestRecipeGenerated(false);
          fetchIngredients();
        } catch (err) {
          console.error(err);
          setMessages(prev => [...prev, { sender: 'bot', text: 'Failed to process your response.' }]);
        }
      } else {
        // NO response – generate new recipe
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: "Okay! Here's another idea using your ingredients..." }
        ]);
        setLatestRecipeGenerated(false); // Reset to allow new flow
        await sendRecipeRequest(); // 🔁 Generate again
      }
    } else {
      setMessages(prev => [...prev, { sender: 'user', text }]);
      setUserInput('');
      await sendRecipeRequest();
    }
  };
  

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      const isHeader = /^(Ingredients|Instructions|Nutritional|Directions|Steps)/i.test(line);
      return (
        <div key={i} style={isHeader ? { fontWeight: 'bold', marginTop: '10px' } : {}}>
          {line}
        </div>
      );
    });
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const text = userInput.trim();
    setUserInput('');
    await handleUserReply(text);
  };

  return (
    <div className="chat-layout" style={{ display: 'flex', height: '100vh' }}>
  {/* Sidebar */}
  <div className="sideBar" style={{ backgroundColor: '#e3f2f9', padding: '20px', width: '200px' }}>
    <div
      className="outfit-font"
      style={{
        fontSize: "30px",
        color: "#EC6D53",
        textDecoration: "underline",
        marginBottom: "10px"
      }}
    >
      Your Items
    </div>
    <a href="http://localhost:3000/product" style={{ fontSize: "20px", color: "#333" }}>&gt; Manage</a>
  </div>

  {/* Ingredients Center Column */}
  <div style={{
    backgroundColor: '#ffffff',
    width: '300px',
    padding: '20px',
    borderRight: '1px solid #ccc',
    overflowY: 'auto'
  }}>
    <h3 style={{ fontSize: '22px', color: '#333', marginBottom: '10px' }}>Current Ingredients</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {ingredients.length > 0 ? (
        ingredients
        .filter(item => item && item.trim() !== '' && item.toLowerCase() !== 'string' && !item.includes(','))
        .map((item, i) => (      
          <div
            key={i}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f0f0f0',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {item}
          </div>
        ))
      ) : (
        <p style={{ color: '#777' }}>No ingredients found.</p>
      )}
    </div>
  </div>

  {/* Chatbox */}
  <div className="chatbox" style={{ flex: 1, backgroundColor: '#2c2f3a', color: 'white', display: 'flex', flexDirection: 'column' }}>
    <div className="chat-messages" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
      {messages.map((msg, index) => (
        <div key={index} className={`chat-message ${msg.sender}`} style={{ whiteSpace: 'pre-wrap', marginBottom: '15px' }}>
          <strong>{msg.sender === 'user' ? 'You' : 'FridgeChef'}:</strong>
          <div style={{ marginTop: '5px' }}>{formatMessage(msg.text)}</div>
        </div>
      ))}
    </div>
    <div className="chat-input-container" style={{ display: 'flex', padding: '10px', borderTop: '1px solid #444' }}>
      <input
        className="chat-input"
        type="text"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder="Ask for a recipe or respond with yes/no..."
        style={{ flex: 1, padding: '12px', fontSize: '16px' }}
      />
      <button className="chat-button" onClick={handleSend} style={{ padding: '12px 20px', marginLeft: '10px' }}>Send</button>
    </div>
  </div>
</div>
  );
};

export default RecipeChat;
