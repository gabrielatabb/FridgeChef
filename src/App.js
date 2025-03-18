import './App.css';
import Navbar from './Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';

function App() {
  let component
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
  }

  return( 
  <>
  <Navbar  />
  {component}
  </>
  )
}

export default App;
