import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function LuckyDrawModal({ students, onClose, onWinner }) {
  const safeStudents = Array.isArray(students) ? students : [];
  const [rolling, setRolling] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!rolling || safeStudents.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeStudents.length);
    }, 100);
    
    const timeout = setTimeout(() => {
      setRolling(false);
      clearInterval(interval);
    }, 2000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [rolling, safeStudents.length]);

  const current = safeStudents[index] || null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.card}>
        <X onClick={onClose} style={{position: 'absolute', right: 20, top: 20, cursor: 'pointer'}} />
        <h2>Lucky Draw!</h2>
        {current ? (
          <>
            <img src={current.avatar} style={{width: '150px', margin: '20px'}} alt="winner" />
            <h3>{current.name}</h3>
            {!rolling && (
               <button onClick={() => onWinner(current)} style={modalStyles.saveBtn}>
                 Select Student
               </button>
            )}
          </>
        ) : (
          <div style={{ padding: 40 }}>No students available for the lucky draw.</div>
        )}
      </div>
    </div>
  );

}
// Add this at the very bottom of LuckyDrawModal.jsx
const modalStyles = {
  overlay: { 
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 
  },
  card: { 
    background: 'white', padding: '40px', borderRadius: '30px', 
    width: '400px', textAlign: 'center', position: 'relative' 
  },
  saveBtn: { 
    width: '100%', padding: '15px', background: '#4CAF50', 
    color: 'white', border: 'none', borderRadius: '15px', 
    fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' 
  }
};