import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

// Onboarding steps for different views
const ONBOARDING_STEPS = {
  portal: [
    {
      id: 'welcome',
      title: '👋 Welcome to Class123!',
      description: 'Let\'s set up your classroom! First, you need to create a new class.',
      target: '.add-class-button',
      highlightClass: 'add-class-button',
      position: 'bottom',
      content: 'Click here to create your first class. Enter the class name (e.g., "Room 4A", "Class 2B").',
    },
  ],
  dashboard: [
    {
      id: 'add-student',
      title: '👥 Add Students',
      description: 'Now let\'s add students to your class.',
      target: '.add-student-button',
      highlightClass: 'add-student-button',
      position: 'bottom',
      content: 'Click "Add Student" to enroll a student. Enter their name and choose a cute avatar!',
    },
    {
      id: 'behavior-cards',
      title: '⭐ Behavior Cards',
      description: 'Use behavior cards to award or deduct points.',
      target: '.behavior-cards-container',
      highlightClass: 'behavior-cards-container',
      position: 'top',
      content: '🟢 Green cards = positive behaviors (give points)\n🔴 Red cards = behaviors to improve (deduct points)\n\nClick any card to apply it to a student, then click the student card to award/deduct points.',
    },
    {
      id: 'student-cards',
      title: '🎯 Student Cards',
      description: 'Manage your students here.',
      target: '.student-cards-container',
      highlightClass: 'student-cards-container',
      position: 'top',
      content: 'Each student card shows:\n📊 Current points\n✎ Edit button (change name, avatar, or settings)\n🗑️ Delete button\n\nClick a student card to select behavior cards for them.',
    },
    {
      id: 'attendance',
      title: '✓ Attendance Tracking',
      description: 'Mark students absent or present.',
      target: '[data-navbar-icon="attendance"]',
      highlightClass: 'attendance-button',
      position: 'bottom',
      content: 'Click the checkmark icon to enter attendance mode.\n✓ Click a student card to mark them ABSENT (grayed out, can\'t give points)\n✓ Click again to mark them PRESENT\n✓ Click "Save Attendance" to save changes.',
    },
    {
      id: 'lucky-draw',
      title: '🎲 Lucky Draw',
      description: 'Pick a random student for activities.',
      target: '[data-navbar-icon="lucky-draw"]',
      highlightClass: 'lucky-draw-button',
      position: 'bottom',
      content: 'Click the dice icon to randomly select a student. Great for classroom activities, picking who presents, or choosing line leader!',
    },
    {
      id: 'egg-road',
      title: '🥚 Egg Road - Class Rewards',
      description: 'Track class progress toward goals.',
      target: '[data-navbar-icon="egg-road"]',
      highlightClass: 'egg-road-button',
      position: 'bottom',
      content: 'Click the trophy icon to see your class\'s reward progress. Every point earned by students moves closer to unlocking rewards!',
    },
    {
      id: 'settings',
      title: '⚙️ Settings & Behavior Cards',
      description: 'Customize your classroom settings.',
      target: '[data-navbar-icon="settings"]',
      highlightClass: 'settings-button',
      position: 'bottom',
      content: 'Click the gear icon to:\n⭐ Create custom behavior cards\n📝 Edit behavior cards\n🎯 Manage student details\n🎨 Customize your classroom experience',
    },
    {
      id: 'complete',
      title: '🎉 You\'re Ready!',
      description: 'Your classroom is all set up.',
      target: null,
      highlightClass: null,
      position: 'center',
      content: 'Start awarding points, tracking attendance, and celebrating student achievements! The guide will not appear again unless you want to reset it.',
    },
  ],
};

export default function OnboardingGuide({ view, onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const steps = ONBOARDING_STEPS[view] || [];
  const currentStep = steps[currentStepIndex];

  // Auto-advance when view changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [view]);

  if (!isVisible || !currentStep || steps.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Guide complete
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  const getTooltipPosition = () => {
    if (!currentStep.target) {
      // Center overlay for final step
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
      };
    }

    const element = document.querySelector(currentStep.target);
    if (!element) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
      };
    }

    const rect = element.getBoundingClientRect();
    const offsetTop = 12;

    if (currentStep.position === 'bottom') {
      return {
        position: 'fixed',
        top: `${rect.bottom + offsetTop}px`,
        left: `${Math.max(20, rect.left + rect.width / 2 - 200)}px`,
        zIndex: 10001,
      };
    } else if (currentStep.position === 'top') {
      return {
        position: 'fixed',
        bottom: `${window.innerHeight - rect.top + offsetTop}px`,
        left: `${Math.max(20, rect.left + rect.width / 2 - 200)}px`,
        zIndex: 10001,
      };
    }

    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10001,
    };
  };

  return (
    <>
      {/* Semi-transparent overlay with spotlight on target element */}
      {currentStep.target && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        >
          {/* Spotlight on target element */}
          {(() => {
            const element = document.querySelector(currentStep.target);
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return (
              <div
                style={{
                  position: 'fixed',
                  top: `${rect.top - 8}px`,
                  left: `${rect.left - 8}px`,
                  width: `${rect.width + 16}px`,
                  height: `${rect.height + 16}px`,
                  border: '3px solid #4CAF50',
                  borderRadius: '12px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                  pointerEvents: 'none',
                  zIndex: 9999,
                }}
              />
            );
          })()}
        </div>
      )}

      {/* Tooltip card */}
      <div
        style={{
          ...getTooltipPosition(),
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          animation: 'fadeInUp 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#999',
            padding: '4px',
          }}
          title="Skip guide"
        >
          <X size={20} />
        </button>

        {/* Step header */}
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2D3436',
          }}
        >
          {currentStep.title}
        </h3>

        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.4',
          }}
        >
          {currentStep.description}
        </p>

        {/* Main content */}
        <div
          style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#333',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {currentStep.content}
        </div>

        {/* Step counter */}
        <div
          style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '12px',
          }}
        >
          Step {currentStepIndex + 1} of {steps.length}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#666',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            Skip Guide
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: '#4CAF50',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4CAF50';
            }}
          >
            {currentStepIndex === steps.length - 1 ? 'Got it! ✓' : 'Next'}
            {currentStepIndex < steps.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}
