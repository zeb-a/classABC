import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

const GUIDE_SECTIONS = {
  portal: [
    {
      id: 'add-class',
      category: 'Getting Started',
      title: '➕ Add a New Class',
      description: 'Create a new classroom',
      steps: [
        'Click the "Add Class" button in the top right',
        'Enter your class name (e.g., "Room 4A", "Class 2B")',
        'Click "Create" to add the class to your list',
        'Select the class to start managing students and behaviors',
      ],
      icon: '📚',
    },
    {
      id: 'profile',
      category: 'Account',
      title: '👤 Update Your Profile',
      description: 'Manage your account settings',
      steps: [
        'Click your profile avatar in the top left corner',
        'View your email and account information',
        'You can update your profile picture by clicking on the avatar',
        'Click "Close" to return to your classes',
      ],
      icon: '⚙️',
    },
    {
      id: 'select-class',
      category: 'Getting Started',
      title: '🎓 Select a Class',
      description: 'Open a class to manage students',
      steps: [
        'Your classes appear as cards on the portal',
        'Click any class card to open it',
        'You\'ll see all students in that class',
        'Use the buttons at the top to add students, manage behaviors, and more',
      ],
      icon: '🎯',
    },
    {
      id: 'logout',
      category: 'Account',
      title: '🚪 Sign Out',
      description: 'Exit your account',
      steps: [
        'Click the "Logout" button in the top right',
        'You\'ll be signed out and return to the login screen',
        'You can sign back in anytime with your email',
      ],
      icon: '🔓',
    },
  ],
  dashboard: [
    {
      id: 'add-student',
      category: 'Students',
      title: '👥 Add a Student',
      description: 'Enroll a new student in your class',
      steps: [
        'Click the "Add Student" button',
        'Enter the student\'s name',
        'Choose a gender (affects avatar style)',
        'Click "Create" and the student appears in your grid',
      ],
      icon: '➕',
    },
    {
      id: 'behavior-cards',
      category: 'Behavior Management',
      title: '⭐ Use Behavior Cards',
      description: 'Award or deduct points for behaviors',
      steps: [
        '🟢 Green cards = positive behaviors (award points)',
        '🔴 Red cards = behaviors to improve (deduct points)',
        'Click a behavior card to select it',
        'Then click a student card to apply the behavior',
        'The student\'s score updates instantly',
      ],
      icon: '🎫',
    },
    {
      id: 'customize-behaviors',
      category: 'Behavior Management',
      title: '🔧 Customize Behavior Cards',
      description: 'Create your own behavior cards',
      steps: [
        'Go to Settings (gear icon in the top right)',
        'Scroll to the "Behavior Cards" section',
        'Click "Add Behavior Card"',
        'Enter name, points, type (positive/improvement), and choose an icon',
        'Click "Save" to add it to your class',
      ],
      icon: '✏️',
    },
    {
      id: 'attendance',
      category: 'Student Management',
      title: '✅ Mark Attendance',
      description: 'Track which students are present',
      steps: [
        'Each student has a presence status (present/absent)',
        'Click the status to toggle between present and absent',
        'The button changes color immediately',
        'Attendance is saved automatically',
      ],
      icon: '📋',
    },
    {
      id: 'lucky-draw',
      category: 'Fun Features',
      title: '🎰 Lucky Draw',
      description: 'Randomly select a student for a reward',
      steps: [
        'Click the "Lucky Draw" button',
        'A random student is selected from your class',
        'The selected student gets highlighted',
        'Great for rewards, games, or classroom activities',
      ],
      icon: '🎲',
    },
    {
      id: 'egg-road',
      category: 'Gamification',
      title: '🐣 Egg Road Progress',
      description: 'Visualize student progress with a fun egg animation',
      steps: [
        'Click the "Egg Road" button',
        'See all students on a journey of eggs hatching',
        'Higher scores = eggs progressing further',
        'Reset progress to start a new journey anytime',
      ],
      icon: '🚀',
    },
    {
      id: 'settings',
      category: 'Configuration',
      title: '⚙️ Settings',
      description: 'Manage class settings and behaviors',
      steps: [
        'Click the gear icon in the top right',
        'Update behavior cards for your class',
        'Edit student information (name, avatar, gender)',
        'All changes are saved automatically',
      ],
      icon: '🔨',
    },
  ],
  // --- NEW SECTION ---
  reports: [
    {
      id: 'switch-view',
      category: 'Navigation',
      title: '📊 Class vs. Individual',
      description: 'Switch between the whole class or one student',
      steps: [
        'Use the "Select Student" dropdown',
        'Choose "All Students" to see everyone at once',
        'Choose "Individual" to focus on one specific person',
      ],
      icon: '🔄',
    },
    {
      id: 'change-language',
      category: 'Communication',
      title: '🏮 Send to Chinese Parents',
      description: 'Translate the teacher note automatically',
      steps: [
        'Find the "Language" dropdown on any student card',
        'Select "Chinese Only"',
        'The AI-generated observation will translate instantly for the parents',
      ],
      icon: '🌏',
    },
    {
      id: 'printing',
      category: 'Export',
      title: '🖨️ Print & PDF',
      description: 'Save or print the reports',
      steps: [
        'Click the "Print Reports" button in the top right',
        'The page is optimized to remove the buttons and only print the cards',
        'Select "Save as PDF" in your print settings to send it digitally',
      ],
      icon: '📄',
    },
  ]
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in-out',
  },
  panel: {
    background: 'white',
    width: '100%',
    maxWidth: '450px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-in-out',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '20px',
  },
  searchContainer: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
  },
  section: {
    borderBottom: '1px solid #f0f0f0',
  },
  sectionHeader: {
    padding: '12px 16px',
    background: '#f9f9f9',
    fontSize: '12px',
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  guideItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  guideItemHover: {
    background: '#f5f5f5',
  },
  guideItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  guideItemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  guideItemDescription: {
    fontSize: '12px',
    color: '#888',
    margin: '0',
  },
  steps: {
    padding: '12px 16px 0',
    fontSize: '13px',
    color: '#555',
    lineHeight: '1.6',
  },
  stepItem: {
    margin: '0 0 8px 0',
    paddingLeft: '12px',
    borderLeft: '3px solid #4CAF50',
  },
  noResults: {
    padding: '40px 16px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  },
  emptySearch: {
    padding: '60px 16px',
    textAlign: 'center',
    color: '#aaa',
  },
};

export default function SearchableGuide({ view = 'portal', onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const guides = GUIDE_SECTIONS[view] || GUIDE_SECTIONS.portal;

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides;
    
    const query = searchQuery.toLowerCase();
    return guides.filter(guide => 
      guide.title.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query) ||
      guide.category.toLowerCase().includes(query) ||
      guide.steps.some(step => step.toLowerCase().includes(query))
    );
  }, [searchQuery, guides]);

  const groupedGuides = useMemo(() => {
    const grouped = {};
    filteredGuides.forEach(guide => {
      if (!grouped[guide.category]) {
        grouped[guide.category] = [];
      }
      grouped[guide.category].push(guide);
    });
    return grouped;
  }, [filteredGuides]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={styles.container} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>📚 Guide & Help</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedId(null); // Reset expanded on search
            }}
            style={{
              ...styles.searchInput,
              borderColor: searchQuery ? '#4CAF50' : '#ddd',
            }}
          />
        </div>

        {/* Content */}
        <div style={styles.content}>
          {filteredGuides.length === 0 ? (
            <div style={styles.noResults}>
              {searchQuery ? (
                <>
                  <p>No guides found for "{searchQuery}"</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>Try a different search term</p>
                </>
              ) : (
                <p>No guides available</p>
              )}
            </div>
          ) : (
            Object.entries(groupedGuides).map(([category, items]) => (
              <div key={category} style={styles.section}>
                <div style={styles.sectionHeader}>{category}</div>
                {items.map(guide => (
                  <div
                    key={guide.id}
                    style={{
                      ...styles.guideItem,
                      ...(expandedId === guide.id ? { background: '#fafafa' } : {}),
                    }}
                    onClick={() => toggleExpand(guide.id)}
                  >
                    <div style={styles.guideItemHeader}>
                      <div style={{ flex: 1 }}>
                        <p style={styles.guideItemTitle}>
                          <span>{guide.icon}</span>
                          {guide.title}
                        </p>
                        {expandedId !== guide.id && (
                          <p style={styles.guideItemDescription}>{guide.description}</p>
                        )}
                      </div>
                      <div style={{ color: '#aaa', flexShrink: 0 }}>
                        {expandedId === guide.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expandedId === guide.id && (
                      <div style={styles.steps}>
                        {guide.steps.map((step, idx) => (
                          <div key={idx} style={styles.stepItem}>
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
