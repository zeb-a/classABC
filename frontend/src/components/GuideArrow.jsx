import React, { useEffect, useState, useRef } from 'react';

/**
 * GuideArrow Component
 * Renders animated curved arrow pointing to guide target with instruction text
 * Repositions dynamically based on scroll and resize
 */
export default function GuideArrow({ step, isVisible }) {
  const [arrowPos, setArrowPos] = useState({ x: 0, y: 0, angle: 0 });
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Update arrow position based on target element
  const updatePosition = () => {
    if (!isVisible || !step) return;

    const targetElement = document.querySelector(step.targetSelector);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const targetCenterX = window.scrollX + rect.left + rect.width / 2;
    const targetCenterY = window.scrollY + rect.top + rect.height / 2;

    // Arrow starts from a floating position above/to the side
    const startX = targetCenterX + (Math.random() - 0.5) * 100;
    const startY = Math.max(100, targetCenterY - 150);

    const dx = targetCenterX - startX;
    const dy = targetCenterY - startY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const distance = Math.sqrt(dx * dx + dy * dy);

    setArrowPos({
      x: startX,
      y: startY,
      angle,
      distance,
      targetX: targetCenterX,
      targetY: targetCenterY,
    });

    // Text position - offset from arrow start
    setTextPos({
      x: startX - 80,
      y: startY - 60,
    });
  };

  // Update on mount and when step changes
  useEffect(() => {
    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [step, isVisible]);

  if (!isVisible || !step) return null;

  const svgWidth = 400;
  const svgHeight = 300;

  // Calculate curve control points for smooth arrow
  const startX = 100;
  const startY = 100;
  const controlX = startX + (arrowPos.distance * 0.3);
  const controlY = startY + (arrowPos.distance * 0.5);
  const endX = arrowPos.distance;
  const endY = 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {/* Animated instruction text */}
      <div
        style={{
          position: 'fixed',
          left: textPos.x,
          top: textPos.y,
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          maxWidth: '200px',
          textAlign: 'center',
          animation: 'guideFloat 3s ease-in-out infinite',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          pointerEvents: 'none',
        }}
      >
        {step.instruction}
      </div>

      {/* SVG Arrow */}
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        style={{
          position: 'fixed',
          left: arrowPos.x - svgWidth / 2,
          top: arrowPos.y - svgHeight / 2,
          pointerEvents: 'none',
          animation: 'guidePulse 1.5s ease-in-out infinite',
        }}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* Curved path */}
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
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle
          cx={svgWidth / 2}
          cy={svgHeight / 2}
          r="40"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          opacity="0.3"
          style={{
            animation: 'guideRing 2s ease-in-out infinite',
          }}
        />

        {/* Curved arrow line */}
        <path
          d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowhead)"
          filter="url(#glow)"
          strokeLinecap="round"
          style={{
            animation: 'guideDraw 0.6s ease-out',
          }}
        />

        {/* Arrow head circle */}
        <circle
          cx={svgWidth / 2}
          cy={svgHeight / 2}
          r="8"
          fill="#4CAF50"
          filter="url(#glow)"
        />
      </svg>

      {/* Global animations */}
      <style>{`
        @keyframes guideFloat {
          0%, 100% {
            transform: translateY(0px);
            opacity: 1;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.95;
          }
        }

        @keyframes guidePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes guideRing {
          0%, 100% {
            r: 35;
            opacity: 0.1;
          }
          50% {
            r: 50;
            opacity: 0.3;
          }
        }

        @keyframes guideDraw {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
