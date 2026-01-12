import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

// Large card point animation with student avatar and behavior emoji
export const PointAnimation = ({ isVisible, studentAvatar, studentName, points = 1, behaviorEmoji = '⭐', onComplete, students }) => {
  const isPositive = points > 0;
  const isWholeClass = students && students.length > 0;
  
  // Play sound effect when animation shows
  useEffect(() => {
    if (isVisible) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Determine sound duration based on points value
      const soundDuration = Math.abs(points) >= 3 ? 2.0 : 1.5; // Much longer for more impact
      
      if (isPositive) {
        // POSITIVE SOUND: Cheerful clapping/wow with uplifting chords
        // Creates a fun, celebratory kid-friendly sound
        const playCheerfulSound = () => {
          // Main celebratory chord progression
          const times = [0, 0.3, 0.6];
          times.forEach((time, idx) => {
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const osc3 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            const gain2 = audioContext.createGain();
            const gain3 = audioContext.createGain();
            
            osc1.connect(gain1);
            osc2.connect(gain2);
            osc3.connect(gain3);
            gain1.connect(audioContext.destination);
            gain2.connect(audioContext.destination);
            gain3.connect(audioContext.destination);
            
            const startTime = audioContext.currentTime + time;
            const duration = 0.25;
            
            // Major chord - happy and celebratory
            const notes = [
              { freq1: 523, freq2: 659, freq3: 784 }, // C-E-G
              { freq1: 587, freq2: 739, freq3: 880 }, // D-F#-A
              { freq1: 659, freq2: 830, freq3: 988 }  // E-G#-B
            ];
            const note = notes[idx % notes.length];
            
            osc1.frequency.setValueAtTime(note.freq1, startTime);
            osc2.frequency.setValueAtTime(note.freq2, startTime);
            osc3.frequency.setValueAtTime(note.freq3, startTime);
            
            gain1.gain.setValueAtTime(0.25, startTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            gain2.gain.setValueAtTime(0.2, startTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            gain3.gain.setValueAtTime(0.15, startTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            osc1.start(startTime);
            osc2.start(startTime);
            osc3.start(startTime);
            osc1.stop(startTime + duration);
            osc2.stop(startTime + duration);
            osc3.stop(startTime + duration);
          });
          
          // Add "clap" percussive sound at the end
          const clapTime = audioContext.currentTime + 0.9;
          for (let i = 0; i < 2; i++) {
            const clapOsc = audioContext.createOscillator();
            const clapGain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            clapOsc.connect(filter);
            filter.connect(clapGain);
            clapGain.connect(audioContext.destination);
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(4000, clapTime);
            
            clapOsc.frequency.setValueAtTime(150 - i * 50, clapTime + i * 0.15);
            clapOsc.frequency.exponentialRampToValueAtTime(50, clapTime + i * 0.15 + 0.1);
            
            clapGain.gain.setValueAtTime(0.3, clapTime + i * 0.15);
            clapGain.gain.exponentialRampToValueAtTime(0.01, clapTime + i * 0.15 + 0.1);
            
            clapOsc.start(clapTime + i * 0.15);
            clapOsc.stop(clapTime + i * 0.15 + 0.1);
          }
        };
        playCheerfulSound();
      } else {
        // NEGATIVE SOUND: Longer sad/disappointed trombone-like sound
        const sadDuration = 2.2; // Much longer than positive
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        const gainNode2 = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode1);
        filter.connect(gainNode2);
        gainNode1.connect(audioContext.destination);
        gainNode2.connect(audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        // Sad descending pitches - slow and mournful
        const startTime = audioContext.currentTime;
        osc1.frequency.setValueAtTime(600, startTime);
        osc1.frequency.linearRampToValueAtTime(300, startTime + sadDuration * 0.6);
        osc1.frequency.linearRampToValueAtTime(200, startTime + sadDuration);
        
        // Harmony moving down
        osc2.frequency.setValueAtTime(400, startTime);
        osc2.frequency.linearRampToValueAtTime(200, startTime + sadDuration * 0.6);
        osc2.frequency.linearRampToValueAtTime(120, startTime + sadDuration);
        
        // Slow, sustained fade for sad effect
        gainNode1.gain.setValueAtTime(0.3, startTime);
        gainNode1.gain.linearRampToValueAtTime(0.25, startTime + sadDuration * 0.3);
        gainNode1.gain.linearRampToValueAtTime(0.2, startTime + sadDuration * 0.6);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, startTime + sadDuration);
        
        gainNode2.gain.setValueAtTime(0.25, startTime);
        gainNode2.gain.linearRampToValueAtTime(0.2, startTime + sadDuration * 0.3);
        gainNode2.gain.linearRampToValueAtTime(0.15, startTime + sadDuration * 0.6);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, startTime + sadDuration);
        
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + sadDuration);
        osc2.stop(startTime + sadDuration);
      }
    }
  }, [isVisible, isPositive, points]);
  const backgroundColor = isPositive ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)';
  const borderColor = isPositive ? '#FFA500' : '#FF4757';
  
  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#000',
              pointerEvents: 'none',
              zIndex: 2999
            }}
          />
          
          {/* Card centered in middle of screen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40vw',
              maxWidth: '500px',
              minWidth: '300px',
              background: backgroundColor,
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 3000,
              border: `4px solid ${borderColor}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            {/* Display avatars - single or group */}
            {isWholeClass ? (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '-8px',
                marginBottom: '10px'
              }}>
                {students.slice(0, 6).map((student, idx) => (
                  <motion.img
                    key={student.id}
                    src={student.avatar}
                    alt={student.name}
                    animate={{ y: [0, -8, 0], rotate: [-5 + idx * 2, 0, -5 + idx * 2] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: idx * 0.1,
                      ease: 'easeInOut'
                    }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      marginLeft: idx > 0 ? '-12px' : '0',
                      zIndex: 10 - idx
                    }}
                  />
                ))}
                {students.length > 6 && (
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '3px solid white',
                    background: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white',
                    marginLeft: '-12px',
                    fontSize: '14px'
                  }}>
                    +{students.length - 6}
                  </div>
                )}
              </div>
            ) : (
              <img
                src={studentAvatar}
                alt={studentName}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  marginBottom: '10px'
                }}
              />
            )}

            {/* Student Name */}
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {studentName}
            </div>

            {/* Points Display with Behavior Emoji */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '56px',
              fontWeight: '900',
              color: 'white',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              <span style={{ fontSize: '64px' }}>{behaviorEmoji}</span>
              <span>{isPositive ? '+' : ''}{points}</span>
            </div>

            {/* Pulse animation for emphasis */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              style={{
                position: 'absolute',
                inset: '0',
                borderRadius: '24px',
                border: `2px solid ${borderColor}`,
                pointerEvents: 'none'
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use createPortal to render at document root for true centering
  return createPortal(content, document.body);
};