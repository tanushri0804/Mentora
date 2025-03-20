import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './Components/HomePage';
import LoginPage from './Components/LoginPage';
import ChatInterface from './Components/ChatInterface';
import MoodTracker from './Components/MoodTracker';
import SelfCareResources from './Components/SelfCareResources';
import Storyteller from './Components/Storyteller';
import QuestionAns from './Components/QuestionAns'; // Import the QuestionAns component
import Sleeptool from './Components/Sleeptool';
import Creative from './Components/Creative';

// Import icons from react-icons/fa for web
import { FaCommentAlt, FaHeartbeat, FaLeaf, FaRainbow } from 'react-icons/fa';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes for HomePage and LoginPage */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ChatInterface includes the bottom navigation */}
        <Route path="/chat/*" element={<ChatInterfaceWithTabs />} />

        {/* Route for QuestionAns component */}
        <Route path="/question-ans" element={<QuestionAns />} />

        <Route path="/sleeptool" element={<Sleeptool />} />

        <Route path="/creative" element={<Creative />} />
        
      </Routes>
    </Router>
  );
}

// Bottom navigation tabs for Chatbot, Mood Tracker, Self-Care, and Settings
const ChatInterfaceWithTabs = () => (
  <div>
    {/* Main content for the selected tab */}
    <Routes>
      <Route path="chatbot" element={<ChatInterface />} />
      <Route path="mood-tracker" element={<MoodTracker />} />
      <Route path="self-care" element={<SelfCareResources />} />
      <Route path="story" element={<Storyteller />} />
      {/* Default route if none of the paths match */}
      <Route path="*" element={<ChatInterface />} /> {/* Fallback to ChatInterface */}
    </Routes>

    {/* Bottom navigation */}
    <div className="bottom-nav">
      <Link to="chatbot">
        <FaCommentAlt />
        <span>Chatbot</span>
      </Link>
      <Link to="mood-tracker">
        <FaHeartbeat />
        <span>Mood Tracker</span>
      </Link>
      <Link to="self-care">
        <FaLeaf />
        <span>Self-Care</span>
      </Link>
      <Link to="story">
        <FaRainbow />
        <span>Storyteller</span>
      </Link>
    </div>
  </div>
);

// Basic styling for the bottom navigation
const styles = `
  .bottom-nav {
    display: flex;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #0000;
    border-top: 1px solid #ccc;
    padding: 10px;
  }
  .bottom-nav a {
    text-align: center;
    color: grey;
    text-decoration: none;
  }
  .bottom-nav a:hover {
    color: white;
  }
  .bottom-nav a span {
    display: block;
    font-size: 12px;
  }
`;

// Inject styles into the head of the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App;
