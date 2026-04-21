# Mentora - AI-Powered Mental Wellness Companion

Mentora is a comprehensive mental health and wellness application that provides users with AI-powered companions for emotional support, mood tracking, self-care resources, and community engagement. Built with React and powered by advanced AI technology, Mentora offers a safe and supportive environment for personal growth and well-being.

## Features

### AI Chat Companions
- **Official Mentors**: Pre-built AI companions specializing in different areas:
  - **Mood Mentor**: Your steady companion for emotional balance
  - **Stress Buster**: Immediate stress relief and talk therapy
  - **Dream Weaver**: Dream interpretation and sleep hygiene improvement
  - **Anxiety Ally**: Guidance through anxious thoughts
  - **Relationship Rescuer**: Advice for healthy boundaries and relationships

- **Custom Chatbot Creation**: Build personalized AI mentors with:
  - Custom personality and behavior prompts
  - Personalized intro messages
  - Premium avatar selection (60+ avatars across 5 categories)
  - Public or private visibility settings
  - Custom descriptions and system prompts

### Chat Features
- **Real-time Conversations**: Engage in natural, flowing conversations with AI companions
- **Session Management**: Save and revisit chat sessions with automatic history preservation
- **Typing Indicators**: Visual feedback when AI is responding
- **Message Customization**: Adjustable bubble styles, fonts, and colors
- **Background Themes**: Multiple preset themes with custom background images
- **Chat History**: Browse and resume previous conversations
- **Feedback System**: Rate responses with thumbs up/down

### Mood Tracking
- **Daily Check-ins**: Quick emotional wellness assessments
- **Comprehensive Questions**: Evaluate mood, energy, mental clarity, social connection, and stress levels
- **Visual Mood Reports**: Track emotional patterns over time
- **Personalized Insights**: Get recommendations based on mood trends

### Self-Care Resources
- **Guided Activities**: Timer-based self-care sessions including:
  - Meditation and mindfulness exercises
  - Creative expression activities
  - Sleep support tools
  - Physical exercise routines
  - Reading and journaling prompts
- **Customizable Durations**: Set personalized session lengths
- **Progress Tracking**: Monitor self-care habits and consistency

### Story Sharing Community
- **Emotional Storytelling**: Share personal experiences with different emotional contexts
- **Community Support**: Read and comment on stories from other users
- **Emotion Categories**: Organize stories by emotional themes (joyful, sad, anxious, hopeful, neutral)
- **Interactive Reading**: Page-by-page story navigation with beautiful cover images

### Personalization & Profile
- **Custom Profiles**: Personalize your experience with:
  - Premium avatar selection
  - Display names and pronouns
  - Bio and location information
  - Interest tags
  - Mood color preferences
- **Theme Customization**: 
  - Multiple preset themes (Dark Night, Ocean Blue, Sunset, Minimal Light)
  - Custom background images with opacity controls
  - Adjustable font sizes and message bubble styles
  - Compact display options

### User Experience
- **Authentication System**: Secure login with guest access option
- **Responsive Design**: Optimized for desktop and mobile devices
- **Intuitive Navigation**: Bottom navigation bar for easy access to all features
- **Search Functionality**: Find chatbots and content quickly
- **Real-time Updates**: Live interaction counts and status indicators

## Technology Stack

### Frontend
- **React 18.3.1**: Modern React with hooks and context API
- **React Router 6.27.0**: Client-side routing and navigation
- **React Icons 5.3.0**: Comprehensive icon library
- **Emotion 11.13.3**: CSS-in-JS styling solution
- **FontAwesome 6.6.0**: Premium icon sets

### Architecture
- **Component-Based Design**: Modular, reusable React components
- **Context API**: State management for authentication and themes
- **Service Layer**: Organized API communication and data management
- **Responsive CSS**: Mobile-first design with custom animations

## Key Components

### Core Pages
- **HomePage**: Landing page with authentication and app introduction
- **Discover**: Browse and create AI companions
- **ChatInterface**: Main chat interface with real-time messaging
- **MoodTracker**: Daily emotional wellness assessments
- **SelfCareResources**: Guided self-care activities
- **Storyteller**: Community story sharing platform
- **Profile**: User profile and customization settings

### Supporting Components
- **BottomNav**: Navigation component for main app sections
- **ChatHistory**: Session management and history browsing
- **ChatCustomizer**: Theme and appearance customization
- **DeleteChatModal**: Chat history management
- **LoginPage**: User authentication interface

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API server running (see Mentora-Backend repository)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Mentora.git
cd Mentora
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (one-way operation)

## API Integration

The frontend integrates with a Node.js/Express backend for:
- User authentication and profile management
- AI chatbot services and conversation management
- Chat history and session persistence
- Custom chatbot creation and storage
- Mood tracking data storage
- Story sharing and community features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, questions, or feature requests, please open an issue on the GitHub repository or contact the development team.

---

**Mentora** - Your mind deserves a safe space. Talk, reflect, and heal with your personal AI companion built for emotional well-being, self-care, and growth.
