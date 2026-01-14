import React, { useRef, useEffect, useState } from 'react';

const Whiteboard = ({ onBack }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const startDrawing = ({ nativeEvent }) => {
    if (tool === 'text') {
      const rect = canvasRef.current.getBoundingClientRect();
      setTextPosition({
        x: nativeEvent.clientX - rect.left,
        y: nativeEvent.clientY - rect.top
      });
      setShowTextInput(true);
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || tool === 'text') return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && contextRef.current) {
      contextRef.current.font = `${lineWidth * 6}px Arial`;
      contextRef.current.fillStyle = color;
      contextRef.current.fillText(textInput, textPosition.x, textPosition.y);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const selectTool = (selectedTool) => {
    setTool(selectedTool);
    if (selectedTool === 'eraser') {
      setColor('#FFFFFF');
      setLineWidth(20);
    } else if (selectedTool === 'pen') {
      setColor('#000000');
      setLineWidth(3);
    } else if (selectedTool === 'highlighter') {
      setColor('#FFFF00');
      setLineWidth(10);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', background: '#f8f9fa', flex: 1 }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#2D3436' }}>Class Whiteboard</h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px', textAlign: 'center', maxWidth: '500px' }}>
        Interactive whiteboard for teaching and collaboration!
      </p>
      
      <div style={{ width: '100%', maxWidth: '1000px', height: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => selectTool('pen')} 
            style={{ 
              padding: '8px 16px', 
              background: tool === 'pen' ? '#4CAF50' : '#e9ecef', 
              color: tool === 'pen' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: tool === 'pen' ? 'bold' : 'normal'
            }}
          >
            Pencil
          </button>
          
          <button 
            onClick={() => selectTool('highlighter')} 
            style={{ 
              padding: '8px 16px', 
              background: tool === 'highlighter' ? '#FFEB3B' : '#e9ecef', 
              color: tool === 'highlighter' ? '#333' : '#333', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: tool === 'highlighter' ? 'bold' : 'normal'
            }}
          >
            Highlighter
          </button>
          
          <button 
            onClick={() => selectTool('eraser')} 
            style={{ 
              padding: '8px 16px', 
              background: tool === 'eraser' ? '#FF5722' : '#e9ecef', 
              color: tool === 'eraser' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: tool === 'eraser' ? 'bold' : 'normal'
            }}
          >
            Eraser
          </button>
          
          <button 
            onClick={() => selectTool('text')} 
            style={{ 
              padding: '8px 16px', 
              background: tool === 'text' ? '#9E9E9E' : '#e9ecef', 
              color: tool === 'text' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: tool === 'text' ? 'bold' : 'normal'
            }}
          >
            Text
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="colorPicker">Color:</label>
            <input 
              id="colorPicker"
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              disabled={tool === 'eraser' || tool === 'highlighter'}
              style={{ width: '40px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="lineWidth">Size:</label>
            <input 
              id="lineWidth"
              type="range" 
              min="1" 
              max="50" 
              value={lineWidth} 
              onChange={(e) => setLineWidth(e.target.value)}
              style={{ width: '100px' }}
            />
            <span>{lineWidth}px</span>
          </div>
          
          <button 
            onClick={clearBoard} 
            style={{ 
              padding: '8px 16px', 
              background: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Clear Board
          </button>
        </div>
        
        <div style={{ position: 'relative', flex: 1 }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvasRef.current.dispatchEvent(mouseEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvasRef.current.dispatchEvent(mouseEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              const mouseEvent = new MouseEvent('mouseup', {});
              canvasRef.current.dispatchEvent(mouseEvent);
            }}
            style={{ 
              width: '100%', 
              height: '100%', 
              cursor: tool === 'text' ? 'text' : 'crosshair',
              touchAction: 'none'
            }}
          />
          
          {showTextInput && (
            <div 
              style={{ 
                position: 'absolute', 
                left: `${textPosition.x}px`, 
                top: `${textPosition.y}px`,
                zIndex: 10
              }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                onBlur={handleTextSubmit}
                autoFocus
                style={{
                  fontSize: `${lineWidth * 6}px`,
                  color: color,
                  border: '1px solid #ccc',
                  padding: '2px 4px',
                  outline: 'none'
                }}
                placeholder="Type text..."
              />
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={onBack}
        style={{
          marginTop: '40px',
          padding: '12px 24px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Whiteboard;