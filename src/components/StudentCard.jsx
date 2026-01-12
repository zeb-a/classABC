import React, { useState } from 'react';
import { boringAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import { Edit2, Trash2 } from 'lucide-react';

const StudentCard = ({ student, onClick, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayAvatar = student.avatar || boringAvatar(student.name, student.gender);

  return (
    <div 
      onClick={(e) => {
        if (!e.target.closest('[data-action-btn]')) {
          const rect = e.currentTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2 + window.scrollX;
          const centerY = rect.top + rect.height / 2 + window.scrollY;
          if (onClick) onClick(student, { x: centerX, y: centerY });
        }
      }}
      style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        position: 'relative',
        aspectRatio: '1 / 1'
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isHovered && (onEdit || onDelete) && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', gap: '8px', zIndex: 10
        }}>
          {onEdit && (
            <button
              data-action-btn
              onClick={(e) => {
                e.stopPropagation();
                onEdit(student);
              }}
              style={{
                background: 'white', border: '1px solid #ddd',
                borderRadius: '8px', padding: '8px', cursor: 'pointer',
                color: '#4CAF50', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E8F5E9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              data-action-btn
              onClick={(e) => {
                e.stopPropagation();
                onDelete(student);
              }}
              style={{
                background: 'white', border: '1px solid #ddd',
                borderRadius: '8px', padding: '8px', cursor: 'pointer',
                color: '#FF6B6B', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFEBEE'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      <div style={{
        position: 'absolute', top: '12px', left: '12px',
        background: '#E3F2FD', color: '#2196F3',
        width: 'clamp(36px, 12%, 56px)',
        height: 'clamp(36px, 12%, 56px)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: 'clamp(0.9rem, 3vw, 1.3rem)'
      }}>
        {student.score}
      </div>

      <SafeAvatar
        src={displayAvatar}
        name={student.name}
        alt={student.name}
        loading="lazy"
        style={{
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          objectFit: 'cover',
          border: 'clamp(3px, 1.5%, 6px) solid white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          backgroundColor: '#FFEAA7'
        }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '14px',
        fontWeight: '800',
        fontSize: 'clamp(0.9rem, 4%, 1.2rem)',
        color: '#2D3436',
        textAlign: 'center',
        maxWidth: '85%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {student.name}
      </div>
    </div>
  );
};


const styles = {
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  }
};
export default StudentCard;