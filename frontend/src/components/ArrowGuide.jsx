import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Arrow-based step-by-step guide
 * Draws an arrow from a guide position pointing to the target element
 * Auto-advances when the user clicks the target element
 */
export default function ArrowGuide({ steps, currentStepIndex, onNext, onClose }) {
  const [arrowPos, setArrowPos] = useState({ x: 0, y: 0 });
  const [labelPos, setLabelPos] = useState({ x: 0, y: 0 });

  const step = steps[currentStepIndex];

  // Auto-advance when user clicks the target element
  useEffect(() => {
    if (!step.target) return;

    const handleClickOnTarget = (e) => {
      const element = document.querySelector(step.target);
      if (!element) return;

      // Check if the clicked element is the target or a child of the target
      if (element.contains(e.target) || e.target === element) {
        // Give a tiny delay to allow the action to start
        setTimeout(() => {
          onNext();
        }, 100);
      }
    };

    // Attach listener to document
    document.addEventListener('click', handleClickOnTarget, true); // Use capture phase

    return () => {
      document.removeEventListener('click', handleClickOnTarget, true);
    };
  }, [step, onNext]);

  useEffect(() => {
    if (!step.target) return;

    const updatePositions = () => {
      const element = document.querySelector(step.target);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Position label opposite to where we're pointing
      let labelX = rect.left - 200;
      let labelY = rect.top + rect.height + 20;

      if (labelX < 20) {
        labelX = rect.right + 20;
      }
      if (labelY > window.innerHeight - 150) {
        labelY = rect.top - 150;
      }

      setArrowPos({
        x: centerX,
        y: centerY,
        rectTop: rect.top,
        rectLeft: rect.left,
        rectWidth: rect.width,
        rectHeight: rect.height,
      });

      setLabelPos({ x: labelX, y: labelY });
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [step]);

  if (!step) return null;

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <>
      {/* SVG for arrow */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      >
        {/* Highlight circle around target */}
        {arrowPos.x && arrowPos.y && (
          <>
            {/* Outer glow circle */}
            <circle
              cx={arrowPos.x}
              cy={arrowPos.y}
              r={Math.max(arrowPos.rectWidth, arrowPos.rectHeight) / 2 + 15}
              fill="none"
              stroke="#4CAF50"
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.8"
            />

            {/* Animated pulse circle */}
            <circle
              cx={arrowPos.x}
              cy={arrowPos.y}
              r={Math.max(arrowPos.rectWidth, arrowPos.rectHeight) / 2 + 20}
              fill="none"
              stroke="#4CAF50"
              strokeWidth="2"
              opacity="0.4"
              style={{
                animation: 'pulse-ring 2s infinite',
              }}
            />

            {/* Arrow from label to target */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
              </marker>
              <style>{`
                @keyframes pulse-ring {
                  0% {
                    r: ${Math.max(arrowPos.rectWidth, arrowPos.rectHeight) / 2 + 20};
                    opacity: 0.4;
                  }
                  100% {
                    r: ${Math.max(arrowPos.rectWidth, arrowPos.rectHeight) / 2 + 35};
                    opacity: 0;
                  }
                }
              `}</style>
            </defs>

            {/* Line with arrow */}
            <line
              x1={labelPos.x + 180}
              y1={labelPos.y + 60}
              x2={arrowPos.x}
              y2={arrowPos.y}
              stroke="#4CAF50"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
              opacity="0.8"
            />
          </>
        )}
      </svg>

      {/* Semi-transparent overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9997,
          cursor: 'help',
        }}
      />

      {/* Instruction label */}
      {labelPos.x > 0 && (
        <div
          style={{
            position: 'fixed',
            left: `${labelPos.x}px`,
            top: `${labelPos.y}px`,
            background: 'white',
            border: '3px solid #4CAF50',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '280px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#999',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>

          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2D3436',
            }}
          >
            {step.title}
          </h3>

          <p
            style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              color: '#555',
              lineHeight: '1.4',
            }}
          >
            {step.description}
          </p>

          {/* Step counter and button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #eee',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: '#999',
              }}
            >
              Step {currentStepIndex + 1} of {steps.length}
            </span>

            {isLastStep ? (
              <button
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                Got it! ✓
              </button>
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  color: '#4CAF50',
                  fontWeight: 'bold',
                }}
              >
                ✓ Detected! Next step →
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
