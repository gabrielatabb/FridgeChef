import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/LoginSignup/LoginSignup';
import Product from './pages/Product';
import RecipeChat from './pages/RecipeChat';
import SavedRecipePage from './pages/SavedRecipePage';
import ProductTools from './pages/ProductTools';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/saved-recipe" element={<SavedRecipePage />} />
        <Route path="/product" element={<Product />} />
        <Route path="/tools" element={<ProductTools />} /> 
        <Route path="/recipeChat" element={<RecipeChat />} />
      </Routes>
    </>
  );
}

export default App;
