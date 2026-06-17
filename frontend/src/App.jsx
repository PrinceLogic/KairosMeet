import './App.css'
import LandingPage from './pages/landing';
import Authentication from './pages/Authentication/authentication';
import Profile from './pages/Profile/Profile';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import VideoMeetComponent from './pages/VideoMeet/VideoMeet';
import CreateMeeting from './pages/CreateMeeting/CreateMeeting';
import JoinMeeting from './pages/JoinMeeting/JoinMeeting';

function App() {
  return (
    <div className='App'>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreateMeeting />} />
            <Route path="/join" element={<JoinMeeting />} />
            <Route path='/:url' element={<VideoMeetComponent />}>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </div>

  );
}


export default App

