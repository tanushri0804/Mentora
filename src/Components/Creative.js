import React, { useState, useRef } from 'react';
import CreativeBG from '../assets/CreativeBG.jpeg';

const Creative = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showResponseBox, setShowResponseBox] = useState(false);
  const [isDrawingPrompt, setIsDrawingPrompt] = useState(false);
  const [color, setColor] = useState('#000000'); // Default black color
  const [brushSize, setBrushSize] = useState(4); // Default brush size

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const prompts = [
    "Draw your current mood using shapes and colors.",
    "Write a sentence about a magical place you've imagined.",
    "Create a quick story about a character who finds a mysterious object.",
    "Design an emoji that represents how you feel today.",
    "List five things you're grateful for in a creative way.",
    "Invent a new name for a color and describe it.",
    "Describe the sound of your favorite memory.",
    "Imagine you're an explorer. What do you see on a new planet?",
  ];

  const drawingPrompts = [
    "Draw your current mood using shapes and colors.",
    "Design an emoji that represents how you feel today.",
  ];

  const handleGeneratePrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setSelectedPrompt(randomPrompt);
    setIsDrawingPrompt(drawingPrompts.includes(randomPrompt));
    setShowResponseBox(true);
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    lastX.current = offsetX;
    lastY.current = offsetY;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    lastX.current = offsetX;
    lastY.current = offsetY;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  return (
    <div style={{
      backgroundImage: `url(${CreativeBG})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '10px',
        padding: '20px',
        width: '90%',
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: '20px',
        }}>Creative Prompts</h1>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}>
          {selectedPrompt ? (
            <p style={{
              fontSize: '18px',
              color: '#333333',
            }}>{selectedPrompt}</p>
          ) : (
            <p style={{
              fontSize: '16px',
              color: '#888888',
            }}>Tap the button to generate a prompt!</p>
          )}
        </div>
        <button 
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '20px',
          }} 
          onClick={handleGeneratePrompt}
        >
          Generate Prompt
        </button>
      </div>

      {showResponseBox && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          width: '90%',
          maxWidth: '600px',
          textAlign: 'center',
        }}>
          {isDrawingPrompt ? (
            <div style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              width: '100%',
              height: '300px',
              backgroundColor: '#f0f0f0',
            }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                style={{
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#fff',
                  cursor: 'crosshair',
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          ) : (
            <textarea 
              placeholder="Express yourself here..." 
              style={{
                width: '100%',
                height: '150px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                padding: '10px',
                fontSize: '16px',
                resize: 'none',
              }}
            />
          )}
          
          {/* Only show the brush settings if in drawing mode */}
          {isDrawingPrompt && (
            <div style={{
              marginTop: '20px',
            }}>
              <div>
                <label style={{ fontSize: '16px', color: '#333' }}>Brush Color:</label>
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                />
              </div>
              <div style={{
                marginTop: '10px',
              }}>
                <label style={{ fontSize: '16px', color: '#333' }}>Brush Size:</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(e.target.value)} 
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Creative;
