import React, { useState } from 'react';
import { ChevronLeft, Trash2, Edit2, Plus, LayoutGrid, X, Save } from 'lucide-react';
import { boringAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import api from '../services/api';

const EMOJI_OPTIONS = ['⭐', '🌟', '✨', '👏', '🎉', '🔥', '💪', '🤩', '😔', '👎', '😤', '⚠️', '❌', '🙅', '😠'];
let showEmojiPicker = false; // This needs to be in component state

export default function SettingsPage({ activeClass, behaviors, onBack, onUpdateBehaviors, onUpdateStudents }) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'students' | 'general'
  const [cards, setCards] = useState(Array.isArray(behaviors) ? behaviors : []);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState({ label: '', pts: 0, icon: '⭐', type: 'wow' });
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  React.useEffect(() => setCards(Array.isArray(behaviors) ? behaviors : []), [behaviors]);

  // Clean up unsaved cards when leaving settings
  const handleBackClick = () => {
    // Discard any unsaved "New Card" entries
    const savedCards = cards.filter(c => c.label !== 'New Card' || c.label === 'New Card' && c.id < 1000000000000);
    if (JSON.stringify(savedCards) !== JSON.stringify(cards)) {
      onUpdateBehaviors && onUpdateBehaviors(savedCards);
    }
    onBack();
  };

  const handleSaveCard = (id) => {
    const pts = Number(editingCard.pts);
    const type = pts > 0 ? 'wow' : 'nono';
    const updated = cards.map(c => c.id === id ? { 
      ...c, 
      label: editingCard.label, 
      pts: pts,
      icon: editingCard.icon,
      type: type
    } : c);
    setCards(updated);
    setEditingCardId(null);
    onUpdateBehaviors && onUpdateBehaviors(updated);
  };

  const handleDeleteCard = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    onUpdateBehaviors && onUpdateBehaviors(updated);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft} onClick={handleBackClick}>
          <ChevronLeft size={24} />
          <h2 style={{ margin: 0 }}>Class Settings: {activeClass.name}</h2>
        </div>
        <button style={styles.doneBtn} onClick={handleBackClick}>Done</button>
      </header>

      <div style={styles.mainLayout}>
        {/* Settings Sidebar */}
        <aside style={styles.sidebar}>
          <button 
            onClick={() => setActiveTab('cards')} 
            style={activeTab === 'cards' ? styles.tabActive : styles.tab}
          >
            <LayoutGrid size={20} /> Behavior Cards
          </button>
        </aside>

        {/* Dynamic Content Area */}
        <main style={styles.content}>
          {activeTab === 'cards' ? (
            <section>
              <div style={styles.sectionHeader}>
                <h3>Behavior Point Cards</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={styles.addBtn}
                    onClick={() => {
                      const newCard = { id: Date.now(), label: 'New Card', pts: 1, type: 'wow', icon: '⭐' };
                      const updated = [newCard, ...cards];
                      setCards(updated);
                      setEditingCardId(newCard.id);
                      setEditingCard({ label: newCard.label, pts: newCard.pts, icon: newCard.icon, type: newCard.type });
                    }}
                  ><Plus size={18}/> Add Card</button>
                  <button
                    style={{...styles.addBtn, background: '#FF7675'}}
                    onClick={async () => {
                      const INITIAL_BEHAVIORS = [
                        { id: 1, label: 'Helped Friend', pts: 1, type: 'wow', icon: '🤝' },
                        { id: 2, label: 'Great Work', pts: 2, type: 'wow', icon: '🌟' },
                        { id: 3, label: 'On Task', pts: 1, type: 'wow', icon: '📖' },
                        { id: 4, label: 'Kindness', pts: 1, type: 'wow', icon: '❤️' },
                        { id: 5, label: 'Noisy', pts: -1, type: 'nono', icon: '📢' },
                        { id: 6, label: 'Disruptive', pts: -2, type: 'nono', icon: '⚠️' }
                      ];
                      
                      // Delete all "New Card" entries from backend
                      try {
                        await api.deleteNewCards();
                        console.log('Deleted all "New Card" entries from backend');
                      } catch (e) {
                        console.warn('Failed to delete "New Card" entries:', e.message);
                      }
                      
                      setCards(INITIAL_BEHAVIORS);
                      onUpdateBehaviors && onUpdateBehaviors(INITIAL_BEHAVIORS);
                      setEditingCardId(null);
                    }}
                  >Reset to Defaults</button>
                </div>
              </div>
              <div style={styles.cardList}>
                {cards.map(card => (
                  <div key={card.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemIcon}>{card.icon}</span>
                      <div>
                        {editingCardId === card.id ? (
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              <input 
                                value={editingCard.label} 
                                onChange={(e) => setEditingCard(prev => ({ ...prev, label: e.target.value }))} 
                                placeholder="Card label"
                                style={{ width: '200px' }}
                              />
                            </div>
                            <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input 
                                type="number"
                                value={editingCard.pts} 
                                onChange={(e) => {
                                  const pts = Number(e.target.value);
                                  setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' }));
                                }}
                                style={{ width: 80 }}
                                placeholder="Points"
                              />
                              <span style={{ fontSize: '14px', color: editingCard.pts > 0 ? '#4CAF50' : '#F44336' }}>
                                ({editingCard.pts > 0 ? 'WOW' : 'NONO'})
                              </span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <button 
                                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                style={styles.emojiPickerBtn}
                              >
                                {editingCard.icon} Pick Emoji
                              </button>
                              {isEmojiPickerOpen && (
                                <div style={styles.emojiGrid}>
                                  {EMOJI_OPTIONS.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        setEditingCard(prev => ({ ...prev, icon: emoji }));
                                        setIsEmojiPickerOpen(false);
                                      }}
                                      style={{
                                        ...styles.emojiBtn,
                                        background: editingCard.icon === emoji ? '#E8F5E9' : 'transparent'
                                      }}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={styles.itemLabel}>{card.label}</div>
                            <div style={{ color: card.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '14px' }}>
                              {card.pts > 0 ? '+' : ''}{card.pts} Points ({card.type === 'wow' ? 'WOW' : 'NONO'})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.itemActions}>
                      {editingCardId === card.id ? (
                        <>
                          <button onClick={() => handleSaveCard(card.id)} style={{ ...styles.addBtn, padding: '6px 10px' }}>Save</button>
                          <button onClick={() => setEditingCardId(null)} style={{ ...styles.addBtn, padding: '6px 10px', marginLeft: 8 }}>Cancel</button>
                          <button onClick={() => { handleDeleteCard(card.id); setEditingCardId(null); }} style={{ ...styles.addBtn, padding: '6px 10px', marginLeft: 8, background: '#FF7675' }}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingCardId(card.id); setEditingCard({ label: card.label, pts: card.pts, icon: card.icon, type: card.type }); }} style={styles.actionIcon}>Edit</button>
                          <button onClick={() => handleDeleteCard(card.id)} style={{ ...styles.actionIcon, color: '#FF7675' }}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' },
  header: { padding: '15px 30px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
  doneBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '260px', background: '#fff', borderRight: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  tab: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'transparent', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#64748B' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: '#E8F5E9', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#2E7D32', fontWeight: 'bold' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  addBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  settingItem: { background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  itemIcon: { fontSize: '24px' },
  itemLabel: { fontWeight: 'bold', fontSize: '1.1rem' },
  miniAvatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5' },
  itemActions: { display: 'flex', gap: '20px' },
  actionIcon: { cursor: 'pointer', color: '#94A3B8' },
  emojiPickerBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: 8, padding: '12px', background: '#f9f9f9', borderRadius: '8px' },
  emojiBtn: { fontSize: '24px', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', cursor: 'pointer', background: 'transparent' },
  hoverIcons: { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 },
  iconBtn: { background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4CAF50', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  editModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  editModalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '15px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};