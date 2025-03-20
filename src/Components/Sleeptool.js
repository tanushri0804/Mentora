// Sleeptool.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used for navigation
import SleeptoolBG from '../assets/SleeptoolBG.jpeg'; // Import the local image

const Sleeptool = () => {
    const [showModal, setShowModal] = useState(true);
    const [activeTab, setActiveTab] = useState('Tips'); // "Tips", "Timer", "Notes"
    const [sleepTime, setSleepTime] = useState('');
    const [wakeTime, setWakeTime] = useState('');
    const [notes, setNotes] = useState('');
    const navigate = useNavigate();

    const handleClose = () => {
        setShowModal(false);
        navigate('/chat/self-care'); // Navigate to SelfCareResources.js
    };

    const calculateSleepHours = () => {
        if (!sleepTime || !wakeTime) return null;
        const [sleepH, sleepM] = sleepTime.split(':').map(Number);
        const [wakeH, wakeM] = wakeTime.split(':').map(Number);
        const sleepMinutes = sleepH * 60 + sleepM;
        const wakeMinutes = wakeH * 60 + wakeM;
        let duration = wakeMinutes - sleepMinutes;
        if (duration < 0) duration += 24 * 60; // Handle overnight sleep
        return (duration / 60).toFixed(1);
    };

    const tips = [
        { text: "Avoid screens an hour before bedtime.", emoji: "📵" },
        { text: "Maintain a consistent sleep schedule.", emoji: "⏰" },
        { text: "Keep your bedroom dark and cool.", emoji: "🌙" },
        { text: "Practice relaxation techniques like deep breathing.", emoji: "💆‍♀️" },
        { text: "Limit caffeine and heavy meals before bed.", emoji: "☕" },
    ];

    const renderContent = () => {
        if (activeTab === 'Tips') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {tips.map((tip, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                padding: '10px',
                                borderRadius: '10px',
                                transition: 'background-color 0.3s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(128, 0, 128, 0.5)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{tip.emoji}</span>
                            <p style={{ margin: 0, flex: 1, color: '#fff' }}>{tip.text}</p>
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === 'Timer') {
            const sleepHours = calculateSleepHours();
            return (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '10px', color: '#fff' }}>Enter your sleep and wake-up times:</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <input
                            type="time"
                            value={sleepTime}
                            onChange={(e) => setSleepTime(e.target.value)}
                            style={{ padding: '5px', borderRadius: '5px', border: 'none' }}
                        />
                        <input
                            type="time"
                            value={wakeTime}
                            onChange={(e) => setWakeTime(e.target.value)}
                            style={{ padding: '5px', borderRadius: '5px', border: 'none' }}
                        />
                    </div>
                    {sleepHours && (
                        <div style={{ marginTop: '15px', color: '#fff' }}>
                            {sleepHours >= 8 ? (
                                <>
                                    <p style={{ fontSize: '2rem', margin: 0 }}>😃</p>
                                    <p>Yahhh perfect! Let’s go to bed.</p>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: '2rem', margin: 0 }}>😟</p>
                                    <p>Improve your sleep schedule!</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            );
        } else if (activeTab === 'Notes') {
            return (
                <div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write your notes here..."
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '10px',
                            borderRadius: '10px',
                            border: 'none',
                            fontFamily: 'Arial, sans-serif',
                        }}
                    />
                </div>
            );
        }
    };

    return (
        <div
            style={{
                backgroundImage: `url(${SleeptoolBG})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            {showModal && (
                <div
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Sleep Well</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['Tips', 'Timer', 'Notes'].map((tab, index) => (
                                <span
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        backgroundColor: activeTab === tab ? '#6a5acd' : 'transparent',
                                        color: activeTab === tab ? '#fff' : '#bbb',
                                    }}
                                >
                                    {['💡', '⏱', '📝'][index]}
                                </span>
                            ))}
                        </div>
                    </div>
                    {renderContent()}
                    <button
                        onClick={handleClose}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: 'linear-gradient(45deg, #6a5acd, #8a2be2)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        Got it!
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sleeptool;
