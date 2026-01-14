import React, { useState } from 'react';
import { boringAvatar, fallbackInitialsDataUrl, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import { X, Camera, ChevronDown } from 'lucide-react';
import SafeAvatar from './SafeAvatar';

export default function AddStudentModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('boy');
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);

  // Use selected character if available, otherwise generate from name
  const avatarUrl = uploadedAvatar || (selectedCharacter ? avatarByCharacter(selectedCharacter) : (name ? boringAvatar(name, gender) : fallbackInitialsDataUrl(gender === 'boy' ? 'B' : 'G')));

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Enrol New Student</h3>
          <button style={styles.closeBtn} onClick={onClose}><X /></button>
        </div>

        <div style={{ ...styles.avatarSection, overflow: 'visible' }}>
          <div style={styles.previewContainer}>
            <img src={avatarUrl} alt="Preview" style={styles.previewImg} onError={(e) => { e.target.onerror = null; e.target.src = fallbackInitialsDataUrl(name); }} />
            <div style={{ marginTop: 12 }}>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setUploadedAvatar(reader.result);
                reader.readAsDataURL(file);
              }} />
            </div>
            <div style={styles.cameraBadge}><Camera size={14} /></div>
          </div>
          
          {/* GENDER CHOICE BUTTONS */}
          <div style={styles.genderToggle}>
            <button 
              onClick={() => setGender('boy')} 
              style={gender === 'boy' ? styles.genderActive : styles.genderInactive}
            >
              Boy
            </button>
            <button 
              onClick={() => setGender('girl')} 
              style={gender === 'girl' ? styles.genderActive : styles.genderInactive}
            >
              Girl
            </button>
          </div>
          
          {/* AVATAR DROPDOWN SELECTOR */}
          <div style={{ marginTop: 16, position: 'relative', overflow: 'visible' }}>
            <button 
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              style={styles.selectButton}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {selectedCharacter ? (
                  <>
                    <img src={avatarByCharacter(selectedCharacter)} alt={selectedCharacter} style={{ width: 24, height: 24, borderRadius: 4 }} />
                    <span style={{ textTransform: 'capitalize' }}>{selectedCharacter}</span>
                  </>
                ) : (
                  'Choose character...'
                )}
              </span>
              <ChevronDown size={18} style={{ transform: showAvatarPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {/* AVATAR PICKER DROPDOWN */}
            {showAvatarPicker && (
              <div style={styles.dropdownMenu}>
                <div style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map(char => (
                    <button
                      key={char.name}
                      onClick={() => { 
                        setSelectedCharacter(char.name); 
                        setUploadedAvatar(null);
                        setShowAvatarPicker(false);
                      }}
                      onMouseEnter={() => setHoveredChar(char.name)}
                      onMouseLeave={() => setHoveredChar(null)}
                      style={{
                        ...styles.avatarOption,
                        ...(selectedCharacter === char.name ? styles.avatarOptionSelected : {}),
                        ...(hoveredChar === char.name ? { transform: 'scale(1.15)', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {})
                      }}
                      title={char.label}
                    >
                      <img src={avatarByCharacter(char.name)} alt={char.label} style={{ ...styles.avatarImg, ...(hoveredChar === char.name ? { transform: 'scale(5)', position: 'absolute', bottom: 'calc(100% - 80px)', left: '50%', marginLeft: '-20px', zIndex: 20 } : {}) }} />
                      <span style={styles.avatarLabel}>{char.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <input 
          style={styles.input} 
          placeholder="Student's Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={styles.footer}>
          {/* CANCEL BUTTON */}
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={() => onSave({ name, gender, avatar: avatarUrl })}>Add Student</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px', overflow: 'visible' },
  previewContainer: { position: 'relative', marginBottom: '20px' },
  previewImg: { width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', border: '3px solid #E2E8F0' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white', padding: '6px', borderRadius: '50%' },
  genderToggle: { display: 'flex', background: '#F1F5F9', borderRadius: '12px', padding: '4px', width: '100%' },
  genderActive: { flex: 1, border: 'none', background: 'white', padding: '10px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' },
  genderInactive: { flex: 1, border: 'none', background: 'transparent', padding: '10px', color: '#64748B', cursor: 'pointer' },
  selectButton: { width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#475569', transition: 'all 0.2s' },
  dropdownMenu: { position: 'absolute', bottom: '100%', left: '-110%', right: '-110%', marginBottom: '8px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1001, padding: '16px', minWidth: '550px' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' },
  avatarOption: { background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#666', fontWeight: 500, outline: 'none', width: '70px', justifySelf: 'center' },
  avatarOptionSelected: { background: 'white', border: '2px solid #4CAF50', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' },
  avatarImg: { width: '32px', height: '32px', borderRadius: '6px' },
  avatarLabel: { fontSize: '8px', color: '#999', textTransform: 'capitalize' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '25px', outline: 'none' },
  footer: { display: 'flex', gap: '12px' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 'bold' },
  saveBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer', fontWeight: 'bold' }
};