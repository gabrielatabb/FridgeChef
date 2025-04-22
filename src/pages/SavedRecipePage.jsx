import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles.css';

const SavedRecipePage = () => {
  const location = useLocation();
  const recipe = location.state?.recipe;
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Check out this recipe!',
          text: recipe,
    
        })
        .then(() => console.log('Recipe shared!'))
        .catch((error) => console.error('Error sharing', error));
    } else {
      alert('Sharing not supported in this browser.');
    }
  };
  if (!recipe) {
    return <div style={{ padding: '20px' }}>No recipe found.</div>;
  }

  return (
    <>
    <div className="back-to-chat">
      <a href="/recipeChat">Back to Chat</a>
    </div>

    <div className="saved-recipe-page">
    <div className="recipe-page" style={{ padding: '40px', maxWidth: '800px', margin: 'auto', background: '#f9f9f9', borderRadius: '10px' }}>
      <h1 style={{ color: '#EC6D53', marginBottom: '20px' }}>Saved Recipe</h1>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6' }}>
        {recipe}
      </div>

      <button className="share-button" onClick={handleShare}>
            Share Recipe
      </button>

    </div>
    </div>
    </>
  );
};

export default SavedRecipePage;
