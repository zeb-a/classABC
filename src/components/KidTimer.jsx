import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const KidTimer = ({ initialMinutes = 10, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Play sound effect using Web Audio API
  const playSound = (frequency = 800, duration = 100, type = 'sine') => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.2;

    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  };

  // Play ticking sound every second
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      playSound(600, 50, 'square');
    }
  }, [timeLeft, isRunning]);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;
          
          // Trigger warnings at specific times
          if (newTime <= 10 && newTime > 0) {
            setIsWarning(true);
            playSound(1200, 300, 'sawtooth');
            setTimeout(() => setIsWarning(false), 500);
          } else if (newTime === 60) { // 1 minute warning
            setIsWarning(true);
            playSound(800, 400, 'triangle');
            setTimeout(() => setIsWarning(false), 800);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (onComplete) onComplete();
      playSound(400, 2000, 'sine'); // Completion sound
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalSeconds = initialMinutes * 60;
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Calculate dynamic gradient based on remaining time
  const getGradient = () => {
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage > 50) {
      // Green to yellow
      return `conic-gradient(
        from 0deg at 50% 50%,
        #10B981 ${progressPercentage}%,
        #FBBF24 ${(progressPercentage + 10) % 100}%,
        #10B981 100%
      )`;
    } else if (percentage > 20) {
      // Yellow to orange
      return `conic-gradient(
        from 0deg at 50% 50%,
        #FBBF24 ${progressPercentage}%,
        #F59E0B ${(progressPercentage + 10) % 100}%,
        #FBBF24 100%
      )`;
    } else {
      // Orange to red (warning)
      return `conic-gradient(
        from 0deg at 50% 50%,
        #F59E0B ${progressPercentage}%,
        #EF4444 ${(progressPercentage + 10) % 100}%,
        #F59E0B 100%
      )`;
    }
  };

  const resetTimer = () => {
    setTimeLeft(initialMinutes * 60);
    setIsRunning(false);
    setIsWarning(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      maxWidth: '300px',
      margin: '0 auto'
    }}>
      <div style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        margin: '0 auto'
      }}>
        {/* Gradient ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: getGradient(),
          padding: '4px',
          animation: isWarning ? 'pulse 0.5s ease-in-out infinite alternate' : 'none'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: timeLeft <= 10 ? '#EF4444' : timeLeft <= 60 ? '#F59E0B' : '#10B981',
              fontFamily: 'monospace',
              textShadow: isWarning ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
            }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        
        {/* Critical time indicator */}
        {timeLeft <= 10 && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            animation: 'pulse 0.5s ease-in-out infinite alternate',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
          }}>
            !
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning ? '#EF4444' : '#10B981',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={resetTimer}
          style={{
            background: '#6B7280',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: '#E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '10px'
      }}>
        <div 
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            background: timeLeft <= 10 ? '#EF4444' : timeLeft <= 60 ? '#F59E0B' : '#10B981',
            transition: 'width 1s linear',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
        }
      `}</style>
    </div>
  );
};

export default KidTimer;