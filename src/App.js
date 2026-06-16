import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './Components/HomePage/HomePage';
import LoginPage from './Components/LoginPage/LoginPage';
import ChatInterface from './Components/ChatInterface/ChatInterface';
import MoodTracker from './Components/MoodTracker/MoodTracker';
import MoodHistory from './Components/MoodHistory/MoodHistory';
import SelfCareResources from './Components/SelfCareResources/SelfCareResources';
import Storyteller from './Components/Storyteller/Storyteller';
import QuestionAns from './Components/QuestionAns/QuestionAns';
import Sleeptool from './Components/Sleeptool/Sleeptool';
import Creative from './Components/Creative/Creative';
import BottomNav from './Components/BottomNav/BottomNav';
import Discover from './Components/Discover/Discover';
import ChatList from './Components/ChatList/ChatList';
import Profile from './Components/Profile/Profile';
import PublicProfile from './Components/PublicProfile/PublicProfile';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Routes with Bottom Nav */}
            <Route path="/chat/*" element={<ChatInterfaceWithTabs />} />

            <Route path="/question-ans" element={<QuestionAns />} />
            <Route path="/sleeptool" element={<Sleeptool />} />
            <Route path="/creative" element={<Creative />} />
            <Route path="/profile/:username" element={<PublicProfile />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}


const ChatInterfaceWithTabs = () => {
  const location = useLocation();
  const lastSegment = location.pathname.split('/').pop();
  const isChatRoom = (location.pathname.includes('/chatbot/') || 
                      !['discover', 'chats', 'mood-tracker', 'mood-history', 'self-care', 'story', 'profile', 'chat'].includes(lastSegment)) && 
                      location.pathname !== '/chat';

  return (
    <div className={`app-main-layout ${isChatRoom ? 'in-chat-room' : ''}`}>
      <div className="content-area">
        <Routes>
          <Route path="discover" element={<Discover />} />
          <Route path="chats" element={<ChatList />} />
          <Route path="chatbot/:aiId" element={<ChatInterface />} />
          <Route path=":aiId" element={<ChatInterface />} />
          <Route path="mood-tracker" element={<MoodTracker />} />
          <Route path="mood-history" element={<MoodHistory />} />
          <Route path="self-care" element={<SelfCareResources />} />
          <Route path="story" element={<Storyteller />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Discover />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  );
};


export default App;
