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
      gap: '30px',
      padding: '30px',
      maxWidth: '350px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '25px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
    }}>
      <div style={{
        position: 'relative',
        width: '220px',
        height: '220px',
        margin: '0 auto'
      }}>
        {/* Enhanced Gradient ring with glass-morphism */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: getGradient(),
          padding: '6px',
          animation: isWarning ? 'pulse 0.5s ease-in-out infinite alternate, rotateGradient 3s linear infinite' : 'rotateGradient 3s linear infinite',
          transform: 'rotate(0deg)',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}>
            <div style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: timeLeft <= 10 ? '#EF4444' : timeLeft <= 60 ? '#F59E0B' : '#10B981',
              fontFamily: 'monospace',
              textShadow: isWarning ? '0 0 15px rgba(239, 68, 68, 0.7)' : '0 0 10px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              transform: isWarning ? 'scale(1.1)' : 'scale(1)',
            }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        
        {/* Critical time indicator with enhanced animation */}
        {timeLeft <= 10 && (
          <div style={{
            position: 'absolute',
            top: '-15px',
            right: '-15px',
            background: 'radial-gradient(circle, #ff6b6b, #ee5a52)',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
            animation: 'pulse 0.4s ease-in-out infinite alternate, float 2s ease-in-out infinite',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.3)',
            border: '2px solid white',
          }}>
            ⏰
          </div>
        )}
      </div>

      {/* Visual progress indicator */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: timeLeft <= 10 ? '#EF4444' : timeLeft <= 60 ? '#F59E0B' : '#10B981',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        {timeLeft <= 10 ? "Hurry Up!" : timeLeft <= 60 ? "One Minute Left!" : "Focus Time"}
      </div>

      {/* Controls with enhanced styling */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease, transform 0.1s',
            fontSize: '16px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95) translateY(2px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95) translateY(2px)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={resetTimer}
          style={{
            background: 'linear-gradient(135deg, #6b7280, #4b5563)',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease, transform 0.1s',
            fontSize: '16px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95) translateY(2px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95) translateY(2px)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        >
          <RotateCcw size={24} />
          Reset
        </button>
      </div>

      {/* Progress bar with enhanced styling */}
      <div style={{
        width: '100%',
        height: '12px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '5px',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
        <div 
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            background: timeLeft <= 10 
              ? 'linear-gradient(90deg, #ef4444, #f87171)' 
              : timeLeft <= 60 
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                : 'linear-gradient(90deg, #10b981, #34d399)',
            transition: 'width 1s linear',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          100% { transform: scale(1.1); box-shadow: 0 0 30px rgba(239, 68, 68, 0.9); }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0px); }
          50% { transform: translate(0, -10px); }
          100% { transform: translate(0, 0px); }
        }
        
        @keyframes rotateGradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KidTimer;