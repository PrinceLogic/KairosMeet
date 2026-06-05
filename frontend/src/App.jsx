import './App.css'
import LandingPage from './pages/landing';
import Authentication from './pages/Authentication/authentication';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
        </Routes>
      </Router>
    </div>

  );
}


export default App
