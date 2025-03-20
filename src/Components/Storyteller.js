import React, { useState } from 'react';

// Styling for the page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#121212',
    color: 'white',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  leftSection: {
    flex: 2,
    paddingRight: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: '20px',
    borderRadius: '10px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  heading: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#FFD700',
  },
  textArea: {
    width: '100%',
    height: '200px',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #444',
    backgroundColor: '#222',
    color: 'white',
    fontSize: '1.1rem',
    marginBottom: '20px',
    resize: 'none',
  },
  submitButton: {
    alignSelf: 'center',
    width: '60%',
    padding: '12px',
    backgroundColor: '#6a0dad',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
    textAlign: 'center',
  },
  tipText: {
    fontSize: '1rem',
    textAlign: 'center',
    marginTop: '20px',
    color: '#aaa',
  },
  storyCard: {
    backgroundColor: '#333',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    color: 'white',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
  },
  storyImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  storyTitle: {
    fontSize: '1.3rem',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#FFD700',
  },
  storySnippet: {
    fontSize: '1rem',
    color: '#ddd',
  },
};

const prewrittenStories = [
  {
    id: 1,
    title: 'A Day in the Forest',
    image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?fit=crop&w=500&h=300',
    snippet: 'It was a serene morning in the heart of the forest. The sunlight pierced through the canopy...',
  },
  {
    id: 2,
    title: 'My Journey to the Mountains',
    image: 'https://images.unsplash.com/photo-1542736667-069246bdbc70?fit=crop&w=500&h=300',
    snippet: 'Climbing those rocky trails, I found not just breathtaking views but also a part of myself...',
  },
  {
    id: 3,
    title: 'The Unexpected Adventure',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fit=crop&w=500&h=300',
    snippet: 'What started as a routine day turned into an adventure I’d never forget, with surprises at every turn...',
  },
];

const Storyteller = () => {
  const [story, setStory] = useState('');

  // Handle changes in the story text
  const handleChange = (event) => {
    setStory(event.target.value);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (story) {
      alert('Story submitted successfully!');
      setStory(''); // Clear the story input
    } else {
      alert('Please write your story before submitting.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Section for writing stories */}
      <div style={styles.leftSection}>
        <h1 style={styles.heading}>Share your story with us</h1>
        <textarea
          style={styles.textArea}
          placeholder="Write your story here..."
          value={story}
          onChange={handleChange}
        />
        <button style={styles.submitButton} onClick={handleSubmit}>
          Submit Story
        </button>
        <p style={styles.tipText}>
          Tip: Write freely, and don't worry about perfection. It's all about expressing yourself!
        </p>
      </div>

      {/* Right Section for prewritten stories */}
      <div style={styles.rightSection}>
        {prewrittenStories.map((story) => (
          <div key={story.id} style={styles.storyCard}>
            <img src={story.image} alt={story.title} style={styles.storyImage} />
            <h2 style={styles.storyTitle}>{story.title}</h2>
            <p style={styles.storySnippet}>{story.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storyteller;
