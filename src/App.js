import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Components/HomePage';
import LoginPage from './Components/LoginPage';
import ChatInterface from './Components/ChatInterface';
import MoodTracker from './Components/MoodTracker';
import SelfCareResources from './Components/SelfCareResources';
import Storyteller from './Components/Storyteller';
import QuestionAns from './Components/QuestionAns';
import Sleeptool from './Components/Sleeptool';
import Creative from './Components/Creative';
import BottomNav from './Components/BottomNav';
import Discover from './Components/Discover';
import ChatList from './Components/ChatList';
import Profile from './Components/Profile';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Routes with Bottom Nav */}
          <Route path="/chat/*" element={<ChatInterfaceWithTabs />} />

          <Route path="/question-ans" element={<QuestionAns />} />
          <Route path="/sleeptool" element={<Sleeptool />} />
          <Route path="/creative" element={<Creative />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


const ChatInterfaceWithTabs = () => (
  <div className="app-main-layout">
    <div className="content-area">
      <Routes>
        <Route path="discover" element={<Discover />} />
        <Route path="chats" element={<ChatList />} />
        <Route path="chatbot/:aiId" element={<ChatInterface />} />
        <Route path=":aiId" element={<ChatInterface />} />
        <Route path="mood-tracker" element={<MoodTracker />} />
        <Route path="self-care" element={<SelfCareResources />} />
        <Route path="story" element={<Storyteller />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Discover />} />
      </Routes>
    </div>

    <BottomNav />
  </div>
);


export default App;
