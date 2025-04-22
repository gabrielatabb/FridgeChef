import React, { useState, useEffect } from 'react';
import './Product.css';

const ProductTools = () => {
  const [tool, setTool] = useState('');
  const [tools, setTools] = useState([]);
  const [savedTools, setSavedTools] = useState([]);

  useEffect(() => {
    const fetchSavedTools = async () => {
      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");

      if (!username || !password) {
        console.log("User not authenticated.");
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/get_non_consumables/', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSavedTools(data.non_consumables);
        } else {
          console.error("Failed to fetch saved tools.");
        }
      } catch (error) {
        console.error("Error fetching saved tools:", error);
      }
    };

    fetchSavedTools();
  }, []);

  const handleInputChange = (e) => {
    setTool(e.target.value);
  };

  const handleAddTool = () => {
    if (tool.trim() !== '') {
      setTools([...tools, tool]);
      setTool('');
    }
  };

  const handleStoreTools = async () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
  
    if (!username || !password) {
      alert("User not authenticated.");
      return;
    }
  
    if (tools.length === 0) {
      alert('No tools to store.');
      return;
    }
  
    const response = await fetch('http://localhost:8000/store_non_consumables/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password),
      },
      body: JSON.stringify({
        non_consumables: tools, // ✅ FIXED key
      }),
    });
  
    if (response.ok) {
      setTools([]);
  
      const fetchResponse = await fetch('http://localhost:8000/get_non_consumables/', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
      });
  
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setSavedTools(data.non_consumables);
      } else {
        alert('Failed to fetch saved tools.');
      }
    } else {
      alert('Failed to store tools.');
    }
  };
  

  const handleDeleteTool = async (toolName) => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    const response = await fetch(`http://localhost:8000/delete_non_consumable/${toolName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
      },
    });

    if (response.ok) {
      setSavedTools(savedTools.filter(t => t !== toolName));
    } else {
      alert("Failed to delete tool.");
    }
  };

  return (
    <>
      <div className="back-to-chat">
        <a href="/recipeChat">Back to Chat</a>
      </div>

      <div className="product-page">
        <div className="product-container">
          <h2>Add Tool / Non-Consumable</h2>

          <div className="input-section">
            <input type="text" value={tool} onChange={handleInputChange} placeholder="Enter tool or spice" />
            <button onClick={handleAddTool}>Add</button>
          </div>

          <h3>Tools List</h3>
          <ul>
            {tools.map((t, index) => (
              <li key={index}>{t}</li>
            ))}
          </ul>

          <button onClick={handleStoreTools}>Save Tools</button>

          <h3>Saved Tools</h3>
          <ul>
            {savedTools.map((t, index) => (
              <li key={index}>
                {t}
                <button onClick={() => handleDeleteTool(t)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ProductTools;