import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/LoginSignup/LoginSignup';
import Product from './pages/Product';
import RecipeChat from './pages/RecipeChat';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/product" element={<Product />} />
        <Route path="/recipeChat" element={<RecipeChat />} />
      </Routes>
    </>
  );
}

export default App;
