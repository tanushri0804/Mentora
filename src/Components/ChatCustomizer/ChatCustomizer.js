import React, { useState } from 'react';
import { useTheme, THEME_PRESETS, BACKGROUND_IMAGES } from '../../context/ThemeContext';
import { FaTimes, FaUndo, FaCheck, FaPalette, FaImage, FaFont, FaShapes } from 'react-icons/fa';
import './ChatCustomizer.css';

const ChatCustomizer = ({ isOpen, onClose }) => {
    const { theme, applyTheme, resetTheme } = useTheme();
    const [tempTheme, setTempTheme] = useState(theme);

    // Sync temp theme with global theme when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setTempTheme(theme);
        }
    }, [isOpen, theme]);

    if (!isOpen) return null;

    const handlePresetClick = (name) => {
        setTempTheme(prev => ({
            ...prev,
            ...THEME_PRESETS[name],
            name: name
        }));
    };

    const updateField = (field, value) => {
        setTempTheme(prev => ({
            ...prev,
            [field]: value,
            name: null // Customizing overrides the preset name
        }));
    };

    const handleApply = () => {
        applyTheme(tempTheme);
        onClose();
    };

    const handleReset = () => {
        resetTheme();
        setTempTheme(theme); // This will update in the next render but we can just close it
        onClose();
    };

    return (
        <div className="customizer-overlay" onClick={onClose}>
            <div className="customizer-modal" onClick={e => e.stopPropagation()}>
                <div className="customizer-header">
                    <h2><FaPalette size={18} style={{ marginRight: '10px' }} /> Customize Chat</h2>
                    <button className="close-customizer" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="customizer-body">
                    {/* Left: Preview Column */}
                    <div className="customizer-preview-container">
                        <h3><FaCheck size={12} /> Live Preview</h3>
                        <div className="customizer-preview">
                            <div 
                                className="preview-bg" 
                                style={{ 
                                    backgroundColor: tempTheme.chatBackground,
                                    backgroundImage: tempTheme.backgroundImage ? `url(${tempTheme.backgroundImage})` : 'none',
                                    opacity: tempTheme.backgroundImage ? tempTheme.backgroundOpacity : 1
                                }}
                            ></div>
                            <div 
                                className="preview-msg preview-bot" 
                                style={{ 
                                    background: tempTheme.botBubbleColor,
                                    fontSize: tempTheme.fontSize === 'small' ? '0.8rem' : tempTheme.fontSize === 'large' ? '1.05rem' : '0.95rem',
                                    borderRadius: tempTheme.messageStyle === 'square' ? '8px' : '20px',
                                    padding: tempTheme.isCompact ? '0.6rem 1rem' : '1rem 1.4rem',
                                    marginTop: 'auto' // Push both to bottom but keep order
                                }}
                            >
                                Hello! This is how your messages will look. How are you feeling today?
                            </div>
                            <div 
                                className="preview-msg preview-user" 
                                style={{ 
                                    background: tempTheme.userBubbleColor,
                                    fontSize: tempTheme.fontSize === 'small' ? '0.8rem' : tempTheme.fontSize === 'large' ? '1.05rem' : '0.95rem',
                                    borderRadius: tempTheme.messageStyle === 'square' ? '8px' : '20px',
                                    padding: tempTheme.isCompact ? '0.6rem 1rem' : '1rem 1.4rem'
                                }}
                            >
                                I'm feeling great with this new theme!
                            </div>
                        </div>
                    </div>

                    {/* Right: Options Column */}
                    <div className="customizer-options-container">
                        {/* Theme Presets section */}
                        <div className="customizer-section">
                            <h3><FaPalette size={12} /> Theme Presets</h3>
                            <div className="options-grid">
                                {Object.keys(THEME_PRESETS).map(preset => (
                                    <button 
                                        key={preset}
                                        className={`preset-btn ${tempTheme.name === preset ? 'active' : ''}`}
                                        onClick={() => handlePresetClick(preset)}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Basic Styling section */}
                        <div className="customizer-section">
                            <h3><FaPalette size={12} /> Basic Styling</h3>
                            <div className="color-option">
                                <label>Chat Background</label>
                                <div className="color-input-wrapper">
                                    <input 
                                        type="color" 
                                        className="color-input" 
                                        value={tempTheme.chatBackground.startsWith('#') ? tempTheme.chatBackground : '#11141a'} 
                                        onChange={(e) => updateField('chatBackground', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="color-option">
                                <label>User Message Bubble</label>
                                <div className="color-input-wrapper">
                                    <input 
                                        type="color" 
                                        className="color-input" 
                                        value={tempTheme.userBubbleColor.startsWith('#') ? tempTheme.userBubbleColor : '#2a9d8f'} 
                                        onChange={(e) => updateField('userBubbleColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="color-option">
                                <label>Bot Message Bubble</label>
                                <div className="color-input-wrapper">
                                    <input 
                                        type="color" 
                                        className="color-input" 
                                        value={tempTheme.botBubbleColor.startsWith('#') ? tempTheme.botBubbleColor : '#2b2d31'} 
                                        onChange={(e) => updateField('botBubbleColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Background Images section */}
                        <div className="customizer-section">
                            <h3><FaImage size={12} /> Background Images</h3>
                            <div className="image-grid">
                                <div 
                                    className={`bg-image-option ${!tempTheme.backgroundImage ? 'active' : ''}`}
                                    style={{ background: '#222', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onClick={() => updateField('backgroundImage', null)}
                                >
                                    NONE
                                </div>
                                {BACKGROUND_IMAGES.map((img, idx) => (
                                    <div 
                                        key={idx}
                                        className={`bg-image-option ${tempTheme.backgroundImage === img ? 'active' : ''}`}
                                        style={{ backgroundImage: `url(${img})` }}
                                        onClick={() => updateField('backgroundImage', img)}
                                    />
                                ))}
                            </div>
                            {tempTheme.backgroundImage && (
                                <div className="slider-container">
                                    <label>Background Intensity ({(tempTheme.backgroundOpacity * 100).toFixed(0)}%)</label>
                                    <input 
                                        type="range" min="0.1" max="0.9" step="0.05"
                                        className="style-range"
                                        value={tempTheme.backgroundOpacity}
                                        onChange={(e) => updateField('backgroundOpacity', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Font Size section */}
                        <div className="customizer-section">
                            <h3><FaFont size={12} /> Font Size</h3>
                            <div className="style-toggles">
                                <button className={`toggle-item ${tempTheme.fontSize === 'small' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'small')}>Small</button>
                                <button className={`toggle-item ${tempTheme.fontSize === 'medium' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'medium')}>Medium</button>
                                <button className={`toggle-item ${tempTheme.fontSize === 'large' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'large')}>Large</button>
                            </div>
                        </div>

                        {/* Message Style section */}
                        <div className="customizer-section">
                            <h3><FaShapes size={12} /> Message Style</h3>
                            <div className="style-toggles">
                                <button className={`toggle-item ${tempTheme.messageStyle === 'rounded' ? 'active' : ''}`} onClick={() => updateField('messageStyle', 'rounded')}>Rounded</button>
                                <button className={`toggle-item ${tempTheme.messageStyle === 'square' ? 'active' : ''}`} onClick={() => updateField('messageStyle', 'square')}>Square</button>
                            </div>
                            <button 
                                className={`toggle-item compact-btn ${tempTheme.isCompact ? 'active' : ''}`} 
                                onClick={() => updateField('isCompact', !tempTheme.isCompact)}
                            >
                                {tempTheme.isCompact ? 'Compact: Enabled' : 'Compact: Disabled'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="customizer-footer">
                    <button className="footer-btn btn-reset" onClick={handleReset}><FaUndo /> Reset Default</button>
                    <button className="footer-btn btn-apply" onClick={handleApply}><FaCheck /> Apply Styles</button>
                </div>
            </div>
        </div>
    );
};

export default ChatCustomizer;
