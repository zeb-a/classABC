import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeAvatar from './SafeAvatar';

export default function EggRoad({ classData, onBack, onResetProgress }) {
  const [completedMilestones, setCompletedMilestones] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [showGoalReached, setShowGoalReached] = useState(false);

  const numStudents = classData.students.length || 1;
  const milestonePoints = numStudents * 5;
  
  const milestones = [
    { points: milestonePoints, emoji: '🥚', label: 'Egg Hatches' },
    { points: milestonePoints * 2, emoji: '🐣', label: 'Baby Emerges' },
    { points: milestonePoints * 3, emoji: '🐥', label: 'First Flight' },
    { points: milestonePoints * 4, emoji: '🦅', label: 'Mighty Eagle' }
  ];

  const currentTotal = classData.students.reduce((sum, s) => sum + s.score, 0);
  const currentMilestone = Math.floor(currentTotal / milestonePoints);
  const progressInMilestone = (currentTotal % milestonePoints) / milestonePoints;

  // Get top 3 students
  const getTopStudents = () => {
    return [...classData.students].sort((a, b) => b.score - a.score).slice(0, 3);
  };

  // Play sound effect
  const playCelebrationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        
        frequencies.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.value = 0;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
          o.start(ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + i * 0.1);
          o.stop(ctx.currentTime + 0.4 + i * 0.1);
        });
      }
    } catch (e) {
      console.warn('Sound failed', e);
    }
  };

  // Confetti component
  const Confetti = () => {
    const confetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 2 + Math.random() * 1,
      color: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][Math.floor(Math.random() * 5)]
    }));

    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
        {confetti.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: -10, rotate: 0 }}
            animate={{ opacity: 0, y: window.innerHeight + 20, rotate: 360 }}
            transition={{ duration: item.duration, delay: item.delay, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              left: `${item.left}%`,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: item.color
            }}
          />
        ))}
      </div>
    );
  };

  // Monitor milestone completion
  useEffect(() => {
    if (currentMilestone > completedMilestones && currentMilestone <= milestones.length) {
      setCompletedMilestones(currentMilestone);
      const milestone = milestones[currentMilestone - 1];
      setCelebrationMessage(`🎉 ${milestone.label}! ${milestone.emoji}`);
      setShowCelebration(true);
      playCelebrationSound();
      
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    }
    
    // Show goal reached screen when all milestones completed
    if (currentMilestone >= milestones.length && completedMilestones === milestones.length) {
      setShowGoalReached(true);
    }
  }, [currentMilestone, completedMilestones]);

  const topStudents = getTopStudents();
  
  // Calculate avatar group position along the path
  const groupPosition = Math.min(progressInMilestone * 100, 100);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={styles.title}>🐣 Egg Road Adventure</h2>
      </header>

      {/* Progress Info */}
      <div style={styles.infoBar}>
        <div>
          <strong>Class Points:</strong> {currentTotal} / {milestonePoints * 4}
        </div>
        <div>
          <strong>Milestone:</strong> {currentMilestone} / {milestones.length}
        </div>
      </div>

      {/* Main Road */}
      <div style={styles.roadSection}>
        {/* Stars (Milestones) */}
        <div style={styles.starsContainer}>
          {milestones.map((milestone, index) => {
            const isReached = currentTotal >= milestone.points;
            const xPos = (index / (milestones.length - 1)) * 90 + 5;

            return (
              <motion.div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${xPos}%`,
                  top: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Star */}
                <motion.div
                  animate={{
                    scale: isReached ? [1, 1.3, 1] : 1,
                    opacity: isReached ? 1 : 0.3
                  }}
                  transition={{ duration: 2, repeat: isReached ? Infinity : 0 }}
                  style={{
                    fontSize: '40px',
                    filter: isReached ? 'drop-shadow(0 0 12px #FFD700)' : 'none'
                  }}
                >
                  ⭐
                </motion.div>
                
                {/* Egg Emoji under star */}
                <div style={{ fontSize: '28px', marginTop: '8px' }}>
                  {milestone.emoji}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Road Path (Visual) */}
        <svg width="100%" height="250" style={styles.svg} viewBox="0 0 1000 250">
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFE85C" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          
          {/* Golden Road Path */}
          <path
            d="M 50 120 Q 200 60, 350 120 Q 500 180, 650 120 Q 800 60, 950 120"
            stroke="url(#roadGradient)"
            strokeWidth="80"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Road outline */}
          <path
            d="M 50 120 Q 200 60, 350 120 Q 500 180, 650 120 Q 800 60, 950 120"
            stroke="#B8860B"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
        </svg>

        {/* Avatar Group (moves together) */}
        <motion.div
          style={{
            position: 'absolute',
            left: `${5 + (groupPosition * 0.9)}%`,
            top: '165px',
            display: 'flex',
            gap: '-20px',
            alignItems: 'center',
            transform: 'translateX(-50%)'
          }}
          animate={{ left: `${5 + (groupPosition * 0.9)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {topStudents.map((student, idx) => (
            <motion.div
              key={student.id}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '3px solid white',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                marginLeft: idx > 0 ? '-15px' : 0,
                zIndex: topStudents.length - idx
              }}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: idx * 0.2
              }}
            >
              <SafeAvatar
                src={student?.avatar}
                name={student?.name}
                alt={student?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBarContainer}>
        <div style={styles.progressBarBg}>
          <motion.div
            style={{
              ...styles.progressBarFill,
              width: `${(currentTotal / (milestonePoints * 4)) * 100}%`
            }}
            animate={{ width: `${(currentTotal / (milestonePoints * 4)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div style={styles.progressText}>
          {currentTotal} / {milestonePoints * 4} Points
        </div>
      </div>

      {/* Top Students Info */}
      <div style={styles.topStudentsCard}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2D3436' }}>🏆 Top Travelers</h3>
        <div style={styles.studentsList}>
          {topStudents.map((student, idx) => (
            <div key={student.id} style={styles.studentRow}>
              <div style={styles.ranking}>#{idx + 1}</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                <SafeAvatar
                  src={student?.avatar}
                  name={student?.name}
                  alt={student?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.studentNameSmall}>{student?.name}</div>
              </div>
              <div style={styles.pointsBadge}>{student?.score} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <>
            <Confetti />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={styles.celebrationModal}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.6, repeat: 3 }}
                style={{ fontSize: '80px' }}
              >
                {milestones[currentMilestone - 1]?.emoji}
              </motion.div>
              <h2 style={{ marginTop: '20px', fontSize: '32px', color: '#4CAF50' }}>
                {celebrationMessage}
              </h2>
              <p style={{ marginTop: '10px', fontSize: '18px', color: '#666' }}>
                Great job, class! Keep going! 🎊
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Final Goal Reached */}
      <AnimatePresence>
        {showGoalReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.goalReachedBanner}
          >
            <div style={styles.goalContent}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '100px' }}
              >
                🦅
              </motion.div>
              <h1 style={{ color: 'white', fontSize: '48px', marginTop: '20px' }}>
                🎉 GOAL REACHED! 🎉
              </h1>
              <p style={{ color: 'white', fontSize: '20px', marginTop: '10px' }}>
                Your class has hatched the mighty eagle!
              </p>
              <button
                onClick={() => {
                  setCompletedMilestones(0);
                  setShowGoalReached(false);
                  if (onResetProgress) {
                    onResetProgress();
                  }
                }}
                style={styles.resetBtn}
              >
                Reset & Start New Journey
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 50%, #FFE8F0 100%)',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 10
  },
  backBtn: {
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: 0
  },
  infoBar: {
    display: 'flex',
    gap: '40px',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap'
  },
  roadSection: {
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '20px',
    padding: '60px 40px',
    position: 'relative',
    zIndex: 10,
    marginBottom: '30px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
    minHeight: '300px'
  },
  starsContainer: {
    position: 'relative',
    width: '100%',
    height: '100px'
  },
  svg: {
    position: 'absolute',
    top: '50px',
    width: '100%',
    height: '200px'
  },
  progressBarContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
    zIndex: 10,
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  progressBarBg: {
    width: '100%',
    height: '24px',
    background: '#E0E0E0',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
    borderRadius: '12px',
    transition: 'width 0.5s ease'
  },
  progressText: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2D3436'
  },
  topStudentsCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    position: 'relative',
    zIndex: 10
  },
  studentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  studentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#F8F9FA',
    borderRadius: '10px'
  },
  ranking: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFD700',
    width: '30px'
  },
  studentNameSmall: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D3436'
  },
  pointsBadge: {
    background: '#FFD700',
    color: '#333',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  celebrationModal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
    backdropFilter: 'blur(4px)',
    padding: '20px',
    textAlign: 'center'
  },
  goalReachedBanner: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5001
  },
  goalContent: {
    textAlign: 'center'
  },
  resetBtn: {
    marginTop: '30px',
    padding: '15px 40px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    background: 'white',
    color: '#FF8C00',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.2s'
  }
};