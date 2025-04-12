import './App.css';
import Navbar from './Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/LoginSignup/LoginSignup';
import Product from './pages/Product';


function App() {
  let component
  // eslint-disable-next-line
  switch (window.location.pathname) {
    case "/":
      component = <Home />
      break
    case "/login":
      component = <Login />
      break
    case "/about":
      component = <About />
      break
    case "/product":
      component = <Product />
      break
  }

  return( 
  <>
    <Navbar  />
    {component}
  </>
  )
}

export default App;
