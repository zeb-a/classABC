import React, { useState } from 'react';
import { Plus, LogOut, X, Edit2, Trash2, HelpCircle, Upload } from 'lucide-react';
import { boringAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';

export default function TeacherPortal({ user, classes, onSelectClass, onAddClass, onLogout, onEditProfile, updateClasses }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassAvatar, setNewClassAvatar] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [hoveredClassId, setHoveredClassId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingClassAvatar, setEditingClassAvatar] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const defaultSeeds = ['Alex','Sam','Riley','Jordan','Taylor'];

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    
    const newClass = {
      id: Date.now(),
      name: newClassName,
      students: [], // Starts empty
      avatar: newClassAvatar || (selectedSeed ? boringAvatar(selectedSeed) : boringAvatar(newClassName || 'class')),
      stats: { stars: 0, eggs: 0 }
    };
    
    onAddClass(newClass);
    setNewClassName('');
    setNewClassAvatar(null);
    setShowAddModal(false);
  };

  const handleEditClass = (cls) => {
    setEditingClassId(cls.id);
    setEditingClassName(cls.name);
    setEditingClassAvatar(null);
  };

  const handleSaveEdit = (classId) => {
    const updated = (classes || []).map(c => 
      c.id === classId 
        ? { ...c, name: editingClassName, avatar: editingClassAvatar || c.avatar }
        : c
    );
    updateClasses(updated);
    setEditingClassId(null);
    setEditingClassName('');
    setEditingClassAvatar(null);
  };

  const handleDeleteClass = (classId) => {
    const updated = (classes || []).filter(c => c.id !== classId);
    updateClasses(updated);
    setDeleteConfirmId(null);
  };

  return (
    <div style={{ ...styles.container, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* show logged-in user (compact) */}
          {user && (
            <div style={{ marginLeft: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(user.name || user.email || '').charAt(0).toUpperCase()}</div>
              <div style={{ fontWeight: 700 }}>{user.name || user.email}</div>
              <button onClick={onEditProfile} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#4CAF50', fontWeight: 700 }}>Edit Profile</button>
            </div>
          )}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <button 
            onClick={() => setShowGuide(true)} 
            style={{...styles.helpBtn, background: 'none', border: '1px solid #E6EEF2', padding: '8px 12px' }}
          >
            <HelpCircle size={16}/> Guide
          </button>
          <button onClick={onLogout} style={{ ...styles.logoutBtn, background: 'transparent', border: '1px solid #E6EEF2', padding: '8px 12px' }}><LogOut size={16}/> Logout</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.header}>
          <h2>My Classes</h2>
          <button onClick={() => setShowAddModal(true)} style={styles.addClassBtn} className="add-class-button">
            <Plus size={20} /> Add Class
          </button>
        </div>

        <div style={styles.grid}>
          {(classes || []).map((cls) => (
            <div 
              key={cls.id}
              onClick={() => {
                if (!hoveredClassId || editingClassId || deleteConfirmId) return;
                if (editingClassId !== cls.id && deleteConfirmId !== cls.id) {
                  onSelectClass(cls.id);
                }
              }}
              onMouseEnter={() => setHoveredClassId(cls.id)}
              onMouseLeave={() => setHoveredClassId(null)}
              style={{
                ...styles.classCard,
                position: 'relative',
                cursor: 'pointer',
                transform: hoveredClassId === cls.id ? 'scale(1.03)' : 'scale(1)',
                boxShadow: hoveredClassId === cls.id 
                  ? '0 10px 25px rgba(0,0,0,0.15)' 
                  : '0 4px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Hover Icons */}
              {hoveredClassId === cls.id && (
                <div style={styles.hoverIcons}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditClass(cls); }}
                    style={styles.iconBtn}
                    title="Edit class"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(cls.id); }}
                    style={{...styles.iconBtn, color: '#FF6B6B'}}
                    title="Delete class"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              {/* Edit Modal for this class */}
              {editingClassId === cls.id && (
                <div style={styles.editOverlay} onClick={() => setEditingClassId(null)}>
                  <div style={styles.editModal} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.editModalHeader}>
                      <h3>Edit Class</h3>
                      <X onClick={() => setEditingClassId(null)} style={{cursor: 'pointer'}} size={20} />
                    </div>
                    <input 
                      style={styles.input}
                      placeholder="Class name" 
                      value={editingClassName}
                      onChange={(e) => setEditingClassName(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SafeAvatar src={editingClassAvatar || cls.avatar} name={editingClassName} alt="class" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label htmlFor={`edit-avatar-upload-${cls.id}`} style={styles.uploadLabel}>
                          <Upload size={16} />
                          <span>Upload</span>
                        </label>
                        <input 
                          id={`edit-avatar-upload-${cls.id}`}
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setEditingClassAvatar(reader.result);
                            reader.readAsDataURL(file);
                          }} 
                          style={styles.fileInput}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleSaveEdit(cls.id)} style={{...styles.saveBtn, flex: 1}}>Save</button>
                      <button onClick={() => setEditingClassId(null)} style={{...styles.cancelBtn, flex: 1}}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirmId === cls.id && (
                <div style={styles.editOverlay} onClick={() => setDeleteConfirmId(null)}>
                  <div style={styles.editModal} onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ marginBottom: 16 }}>Delete Class?</h3>
                    <p style={{ marginBottom: 24, color: '#666' }}>Are you sure you want to delete "{cls.name}"? This action cannot be undone.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleDeleteClass(cls.id)} style={{...styles.deleteConfirmBtn, flex: 1}}>Delete</button>
                      <button onClick={() => setDeleteConfirmId(null)} style={{...styles.cancelBtn, flex: 1}}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Class Card Content */}
              <div style={styles.classIcon}>
                <SafeAvatar 
                  src={cls.avatar || boringAvatar(cls.name || 'class')} 
                  name={cls.name} 
                  alt={cls.name} 
                  style={{ width: '75%', height: 120, objectFit: 'cover', borderRadius: 12 }} 
                />
              </div>
              <h3>{cls.name}</h3>
              <p>{cls.students.length} Students</p>
            </div>
          ))}
        </div>
      </main>

      {/* ADD CLASS MODAL WITH CANCEL X */}
      {showAddModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Create New Class</h3>
              <X onClick={() => setShowAddModal(false)} style={{cursor: 'pointer'}} />
            </div>
            <input 
              style={styles.input}
              placeholder="e.g. 4th Grade Math" 
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SafeAvatar src={newClassAvatar || boringAvatar(newClassName || 'class')} name={newClassName} alt="class" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="avatar-upload" style={styles.uploadLabel}>
                  <Upload size={16} />
                  <span>Upload</span>
                </label>
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setNewClassAvatar(reader.result);
                    reader.readAsDataURL(file);
                  }} 
                  style={styles.fileInput}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              {defaultSeeds.map(seed => (
                <div key={seed} onClick={() => { setSelectedSeed(seed); setNewClassAvatar(null); }} style={{ cursor: 'pointer', border: selectedSeed === seed ? '2px solid #4CAF50' : '2px solid transparent', borderRadius: 8, padding: 2 }}>
                  <SafeAvatar src={boringAvatar(seed)} name={seed} alt={seed} style={{ width: 56, height: 56, borderRadius: 8 }} />
                </div>
              ))}
            </div>
            <button onClick={handleCreateClass} style={styles.saveBtn}>Create Class</button>
          </div>
        </div>
      )}

      {/* USAGE GUIDE OVERLAY */}
      {showGuide && (
        <div style={styles.overlay} onClick={() => setShowGuide(false)}>
          <div style={styles.guideModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>How to Use This Portal</h3>
              <X onClick={() => setShowGuide(false)} style={{cursor: 'pointer'}} />
            </div>
            
            <div style={styles.guideContent}>
              <div style={styles.guideSection}>
                <h4>Managing Classes</h4>
                <ul>
                  <li><strong>Add Class:</strong> Click "Add Class" to create a new class</li>
                  <li><strong>View Class:</strong> Click on any class card to enter the class</li>
                  <li><strong>Edit Class:</strong> Hover over a class card and click the edit icon</li>
                  <li><strong>Delete Class:</strong> Hover over a class card and click the trash icon</li>
                </ul>
              </div>
              
              <div style={styles.guideSection}>
                <h4>Student Management</h4>
                <ul>
                  <li>Click on a class to view its student roster</li>
                  <li>Add students using the "+ Add Student" button</li>
                  <li>Track student progress through the dashboard</li>
                </ul>
              </div>
              
              <div style={styles.guideSection}>
                <h4>Navigation Tips</h4>
                <ul>
                  <li>Use the "Logout" button in the top right to sign out</li>
                  <li>Access this guide anytime using the "Guide" button</li>
                  <li>Hover over any element to see available actions</li>
                </ul>
              </div>
            </div>
            
            <button onClick={() => setShowGuide(false)} style={styles.closeGuideBtn}>
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { height: '100vh', background: '#F4F1EA' },
  nav: { padding: '20px 50px', display: 'flex', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #ddd' },
  logo: { color: '#4CAF50', fontWeight: '900', fontSize: '24px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  helpBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  main: { padding: '50px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  addClassBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' },
  classCard: { background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' },
  hoverIcons: { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 },
  iconBtn: { background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4CAF50', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '400px' },
  editModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  guideModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  editModalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  guideContent: { marginBottom: '20px' },
  guideSection: { marginBottom: '20px' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  closeGuideBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '15px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  classIcon: { marginBottom: 12, cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center' },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '500'
  },
  fileInput: {
    display: 'none'
  }
};