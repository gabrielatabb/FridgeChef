import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [hoveredRecipe, setHoveredRecipe] = useState(null);


  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  const navigate = useNavigate();

  useEffect(() => {
    fetchIngredients();
    fetchSavedRecipes();
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

  const fetchSavedRecipes = async () => {
    try {
      const response = await fetch('http://localhost:8000/get_saved_recipes/', {
        headers: {
          Authorization: 'Basic ' + btoa(username + ':' + password)
        }
      });
      const data = await response.json();
      setSavedRecipes(data.recipes || []);
    } catch (error) {
      console.error("Failed to fetch saved recipes", error);
    }
  };
  

    const sendRecipeRequest = async (promptText) => {
      try {
        const response = await fetch('http://localhost:8000/generate_recipe/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(username + ':' + password),
          },
          body: JSON.stringify({ prompt: promptText })
        });
    
        const data = await response.json();
    
        if (data.detail === "No valid ingredients found, please add ingredients to the list and then enter a new prompt!") {
          setMessages(prev => [...prev, { sender: 'bot', text: data.detail }]);
          setLatestRecipeGenerated(false); 
          return; 
        }
    
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: data.recipe },
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
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setUserInput('');

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
          setMessages(prev => [...prev, { sender: 'bot', text: data.message }]);
          setLatestRecipeGenerated(false);
      
          await fetchIngredients();       
          await fetchSavedRecipes();    
        } catch (err) {
          console.error(err);
          setMessages(prev => [...prev, { sender: 'bot', text: 'Failed to process your response.' }]);
        }
      }else if (lowerText === 'no') {
        setMessages(prev => [...prev, { sender: 'bot', text: "Okay! Recipe will not be saved and ingredients will not be removed. Please enter another prompt!" }]);
        setLatestRecipeGenerated(false);
        
      }
    } else {
      await sendRecipeRequest(text);
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
    await handleUserReply(userInput.trim());
  };

  const handleViewRecipe = (recipe) => {
    navigate('/saved-recipe', { state: { recipe } });
  };

  return (
    <div className="chat-layout">
      <div className="sideBar">
        <h2>Saved Recipes</h2>
        <div>
          {savedRecipes.map((rec, idx) => (
            <div
              key={idx}
              className="saved-recipe-item"
              onMouseEnter={() => setHoveredRecipe(rec)}
              onMouseLeave={() => setHoveredRecipe(null)}
              onClick={() => handleViewRecipe(rec)}
            >
              Recipe {idx + 1}
            </div>
          ))}
        </div>
        {hoveredRecipe && (
          <div className="preview-box">
            <div className="preview-content">
              {hoveredRecipe.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ingredients-panel">
        <h2>Current Ingredients</h2>
        <div>
          {ingredients.length > 0 ? (
            ingredients
              .filter(item => item && item.trim() !== '' && item.toLowerCase() !== 'string' && !item.includes(','))
              .map((item, i) => (
                <div key={i} className="ingredient-tag">{item}</div>
              ))
          ) : (
            <p style={{ color: '#777' }}>No ingredients found.</p>
          )}
        </div>
        <div className='manage-ingredients'>
        <a href="/product" style={{ display: 'block', marginTop: '15px'}}>
            &gt; Manage Ingredients
        </a>
        </div>
      </div>

      <div className="chatbox">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <strong>{msg.sender === 'user' ? 'You' : 'FridgeChef'}:</strong>
              <div style={{ marginTop: '5px' }}>{formatMessage(msg.text)}</div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            className="chat-input"
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Ask for a recipe or respond with yes/no..."
          />
          <button className="chat-button" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeChat;
