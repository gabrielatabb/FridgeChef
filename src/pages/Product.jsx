import React, { useState } from 'react';
import './Product.css';


const Product = () => {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [savedIngredients, setSavedIngredients] = useState([]);
  const [userId, setUserId] = useState(1); 

  const handleInputChange = (e) => {
    setIngredient(e.target.value);
  };

  const handleAddIngredient = () => {
    if (ingredient.trim() !== '') {
      setIngredients([...ingredients, ingredient]);
      setIngredient(''); 
    }
  };

  const handleStoreIngredients = async () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
  
    if (!username || !password) {
      alert("User not authenticated.");
      return;
    }
  
    if (ingredients.length === 0) {
      alert('No ingredients to store.');
      return;
    }
  
    const response = await fetch('http://localhost:8000/store_ingredients/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password),
      },
      body: JSON.stringify({
        ingredients: ingredients,
      }),
    });
  
    if (response.ok) {
      alert('Ingredients stored successfully!');
      setIngredients([]); // Clear local input list
    
      // Fetch saved ingredients from the server
      const fetchResponse = await fetch('http://localhost:8000/get_ingredients/', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
      });
    
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setSavedIngredients(data.ingredients); // Update UI with saved data
      } else {
        alert('Failed to fetch saved ingredients.');
      }
    }else{
      alert('Failed to store ingredients.');
    }
  };
  
  const handleDeleteIngredient = async (ingredientName) => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
  
    const response = await fetch(`http://localhost:8000/delete_ingredient/${ingredientName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
      },
    });
  
    if (response.ok) {
      alert(`Deleted ${ingredientName}`);
      setSavedIngredients(savedIngredients.filter(i => i !== ingredientName));
    } else {
      alert("Failed to delete ingredient.");
    }
  };
  

  return (
    <div className="product-container">
      <h2>Add Ingredient</h2>
  
      <div className="input-section">
        <input type="text" value={ingredient} onChange={handleInputChange} placeholder="Enter ingredient" />
        <button onClick={handleAddIngredient}>Add</button>
      </div>
  
      <h3>Ingredients List</h3>
      <ul>
        {ingredients.map((ing, index) => (
          <li key={index}>{ing}</li>
        ))}
      </ul>
  
      <button onClick={handleStoreIngredients}>Save Ingredients</button>
  
      <h3>Saved Ingredients</h3>
      <ul>
        {savedIngredients.map((ing, index) => (
          <li key={index}>
            {ing}
            <button onClick={() => handleDeleteIngredient(ing)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
  
};

export default Product;
