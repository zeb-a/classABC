import React from 'react';
import { X, Trophy, AlertTriangle } from 'lucide-react';

import { boringAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';

export default function BehaviorModal({ student, behaviors, onClose, onGivePoint }) {
  const safeBehaviors = Array.isArray(behaviors) ? behaviors : [];
  
  // Normalize type field - handle both string and array cases
  const normalizedBehaviors = safeBehaviors.map(b => ({
    ...b,
    type: Array.isArray(b.type) ? b.type[0] : (typeof b.type === 'string' ? b.type : '')
  }));
  
  const wowCards = normalizedBehaviors.filter(b => b.type === 'wow');
  const nonoCards = normalizedBehaviors.filter(b => b.type === 'nono');
  const [activeTab, setActiveTab] = React.useState('wow');

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button style={styles.closeBtn} onClick={onClose}><X size={24} /></button>
          <div style={styles.studentInfo}>
              <div style={styles.avatarWrapper}>
              <SafeAvatar src={student.avatar || boringAvatar(student.name, student.gender)} name={student.name} alt={student.name} style={styles.avatar} />
              <div style={styles.scoreBadge}>{student.score}</div>
            </div>
            <h2 style={styles.studentName}>{student.name}</h2>
            <p style={{color: '#888', margin: '5px 0 0'}}>Select a card to award</p>
          </div>
        </div>

        <div style={styles.contentScroll}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
            <button onClick={() => setActiveTab('wow')} style={{ padding: '8px 16px', borderRadius: 12, border: activeTab === 'wow' ? '2px solid #4CAF50' : '1px solid #E6EEF2', background: activeTab === 'wow' ? '#E8F5E9' : 'transparent', cursor: 'pointer' }}>WOW CARDS</button>
            <button onClick={() => setActiveTab('nono')} style={{ padding: '8px 16px', borderRadius: 12, border: activeTab === 'nono' ? '2px solid #F44336' : '1px solid #E6EEF2', background: activeTab === 'nono' ? '#FFEBEE' : 'transparent', cursor: 'pointer' }}>NO-NO CARDS</button>
          </div>

          <div style={styles.section}>
            <div style={styles.buttonGrid} className="behavior-cards-container">
              {(activeTab === 'wow' ? wowCards : nonoCards).map(card => (
                <button key={card.id} onClick={() => onGivePoint(card)} style={activeTab === 'wow' ? styles.cardButton : { ...styles.cardButton, borderLeft: '4px solid #F44336' }}>
                  <div style={{fontSize: '2.2rem', marginBottom: '5px'}}>{card.icon}</div>
                  <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{card.label}</div>
                  <div style={{color: activeTab === 'wow' ? '#4CAF50' : '#F44336', fontWeight: '900'}}>{activeTab === 'wow' ? `+${card.pts}` : card.pts}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 },
  modalCard: { background: '#FFFFFF', width: '90%', maxWidth: '650px', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' },
  header: { padding: '40px 30px 20px', textAlign: 'center', position: 'relative', borderBottom: '1px solid #F0F0F0' },
  closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' },
  studentInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: '10px' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #F4F1EA', objectFit: 'cover' },
  scoreBadge: { position: 'absolute', bottom: '0', right: '0', background: '#4CAF50', color: 'white', width: '35px', height: '35px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '3px solid white' },
  studentName: { margin: '0', fontSize: '1.8rem', fontWeight: '800', color: '#2D3436' },
  contentScroll: { padding: '30px', overflowY: 'auto', flex: 1 },
  buttonGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '15px' },
  cardButton: { background: 'white', border: '1px solid #E0E0E0', borderLeft: '5px solid #4CAF50', borderRadius: '20px', padding: '20px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s' }
};