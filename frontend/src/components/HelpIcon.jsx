import React from 'react';

export default function HelpIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Show guide"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        fontSize: '32px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        zIndex: 9995,
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
      }}
    >
      ?
    </button>
  );
}
