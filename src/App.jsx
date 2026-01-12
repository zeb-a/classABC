import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from './services/api';
import LandingPage from './components/LandingPage';
import TeacherPortal from './components/TeacherPortal';
import ProfileModal from './components/ProfileModal';
import ClassDashboard from './components/ClassDashboard';
import EggRoad from './components/EggRoad';
import SettingsPage from './components/SettingsPage';
import SetupWizard from './components/SetupWizard';
import LuckyDrawModal from './components/LuckyDrawModal';
import StudentCard from './components/StudentCard';
import BehaviorModal from './components/BehaviorModal';
import VerifyEmailPage from './components/VerifyEmailPage';
import { LogOut } from 'lucide-react';
import PasswordResetPage from './components/PasswordResetPage';
import ConfirmAccountPage from './components/ConfirmAccountPage';
import OnboardingGuide from './components/OnboardingGuide';
import HelpIcon from './components/HelpIcon';
import SearchableGuide from './components/SearchableGuide';
import AssignmentsPage from "./components/AssignmentsPage";
// --- INITIAL DATA ---

import { fallbackInitialsDataUrl } from './utils/avatar';

const INITIAL_STUDENTS = [
  { id: 1, name: 'Pablo Picasso', gender: 'boy', score: 0, avatar: fallbackInitialsDataUrl('Pablo Picasso') },
  { id: 2, name: 'Marie Curie', gender: 'girl', score: 0, avatar: fallbackInitialsDataUrl('Marie Curie') }
];

const INITIAL_BEHAVIORS = [
  { id: 1, label: 'Helped Friend', pts: 1, type: 'wow', icon: '🤝' },
  { id: 2, label: 'Great Work', pts: 2, type: 'wow', icon: '🌟' },
  { id: 3, label: 'On Task', pts: 1, type: 'wow', icon: '📖' },
  { id: 4, label: 'Kindness', pts: 1, type: 'wow', icon: '❤️' },
  { id: 5, label: 'Noisy', pts: -1, type: 'nono', icon: '📢' },
  { id: 6, label: 'Disruptive', pts: -2, type: 'nono', icon: '⚠️' }
];

// Note: this file now centralizes app state and delegates UI to components in `/src/components`.
// The large in-file LandingPage/TeacherPortal implementations were replaced with
// imports so each component can be maintained separately.

// ==========================================
// 3. MAIN APP (THE TRAFFIC CONTROLLER)
// ==========================================
function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('class123_logged_in');
    const token = localStorage.getItem('class123_pb_token') || localStorage.getItem('class123_token');
    if (stored && token) {
      return JSON.parse(stored);
    }
    return null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [classes, setClasses] = useState([]);
  const [behaviors, setBehaviors] = useState(() => JSON.parse(localStorage.getItem('class123_behaviors')) || INITIAL_BEHAVIORS);
  const [activeClassId, setActiveClassId] = useState(null);
  const [view, setView] = useState('portal'); // 'portal' | 'dashboard' | 'egg' | 'settings' | 'setup'
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has completed onboarding
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('class123_logged_in');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        const hasCompletedOnboarding = localStorage.getItem(`class123_onboarding_${parsedUser.email}`);
        return !hasCompletedOnboarding;
      }
    }
    return false;
  });

  // 1. Add state to track if we are in the assignment studio
  const [isAssignmentStudioOpen, setIsAssignmentStudioOpen] = useState(false);


  const [showGuide, setShowGuide] = useState(false);

  const saveTimeoutRef = useRef(null);
  const lastSavedHashRef = useRef(null); // Track content hash to prevent duplicate saves

  // Check for email verification token in URL
  const verificationToken = useMemo(() => {
    const hash = window.location.hash;
    const match = hash.match(/confirm-verification\/([^/]+)/);
    return match ? match[1] : null;
  }, []);

  if (verificationToken) {
    return <VerifyEmailPage
      token={verificationToken}
      onSuccess={() => {
        window.location.hash = '';
        window.location.reload();
      }}
      onError={() => {
        window.location.hash = '';
      }}
    />;
  }

  // Load classes and behaviors for logged in user (try backend, fallback to localStorage)
  useEffect(() => {
    // restore token into api layer if present
    const token = localStorage.getItem('class123_pb_token') || localStorage.getItem('class123_token');
    if (token) api.setToken(token);

    if (!user) return;
    let mounted = true;

    // Load classes from PocketBase
    (async () => {
      try {
        const remote = await api.getClasses(user.email);
        if (mounted && Array.isArray(remote)) {
          setClasses(remote.length > 0 ? remote : []);
        }
      } catch (e) {
        // backend not available — load from localStorage fallback
        const key = `class123_data_${user.email}`;
        const localClasses = JSON.parse(localStorage.getItem(key)) || [];
        if (mounted) setClasses(localClasses);
      }
    })();

    // Load behaviors from PocketBase
    (async () => {
      try {
        const remote = await api.getBehaviors();
        if (mounted && Array.isArray(remote)) {
          setBehaviors(remote.length > 0 ? remote : INITIAL_BEHAVIORS);
        }
      } catch (e) {
        // backend not available — load from localStorage fallback
        const localBehaviors = JSON.parse(localStorage.getItem('class123_behaviors')) || INITIAL_BEHAVIORS;
        if (mounted) setBehaviors(localBehaviors);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  // persist behaviors and classes per user (localStorage + backend when available)
  useEffect(() => {
    localStorage.setItem('class123_behaviors', JSON.stringify(behaviors));
    const token = localStorage.getItem('class123_pb_token') || localStorage.getItem('class123_token');

    if (user && token && (behaviors.length > 0 || classes.length > 0)) {
      // Debounce saves to avoid duplicate records
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('[SAVE] Saving behaviors and classes...');
          await api.saveBehaviors(behaviors);
          await api.saveClasses(user.email, classes, behaviors);
        } catch (e) {
          console.error('Save failed:', e.message);
        }
      }, 1000); // Wait 1 second before saving

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [behaviors, classes, user]);

  const onLoginSuccess = (u) => {
    api.setToken(u.token);
    localStorage.setItem('class123_pb_token', u.token);
    localStorage.setItem('class123_logged_in', JSON.stringify(u));
    // Clear old localStorage data to avoid mixing with PocketBase
    localStorage.removeItem(`class123_data_${u.email}`);
    localStorage.removeItem('class123_behaviors');
    setUser(u);
    // Check if this is a new user (no onboarding flag set)
    const hasCompletedOnboarding = localStorage.getItem(`class123_onboarding_${u.email}`);
    setShowOnboarding(!hasCompletedOnboarding);
  };

  const onLogout = () => {
    localStorage.removeItem('class123_logged_in');
    // clear any persisted auth token
    api.setToken(null);
    localStorage.removeItem('class123_pb_token');
    localStorage.removeItem('class123_token');
    setUser(null);
    setClasses([]);
    setActiveClassId(null);
    setView('portal');
    setShowOnboarding(false);
  };

  const onAddClass = (newClass) => {
    setClasses(prev => {
      const next = [...prev, newClass];
      // persist to localStorage only, backend save via effect
      try {
        if (user && user.email) {
          const key = `class123_data_${user.email}`;
          localStorage.setItem(key, JSON.stringify(next));
        }
      } catch (e) { }
      return next;
    });
  };

  const onSelectClass = (classId) => {
    setActiveClassId(classId);
    setView('dashboard');
  };

  const updateClasses = (updater) => {
    // Accept either functional updater or direct value
    setClasses(prev => {
      const next = (typeof updater === 'function' ? updater(prev) : updater);
      try {
        if (user && user.email) {
          const key = `class123_data_${user.email}`;
          localStorage.setItem(key, JSON.stringify(next));
        }
      } catch (e) { }
      return next;
    });
  };

  const activeClass = classes.find(c => c.id === activeClassId) || null;
  // --- THIS BLOCK MUST BE HERE (ABOVE THE MAIN RETURN) ---
  if (isAssignmentStudioOpen) {
    console.log("App.jsx: Rendering AssignmentsPage now!");
    return (
      <AssignmentsPage
        activeClass={activeClass}
        onBack={() => setIsAssignmentStudioOpen(false)}
        onPublish={(assignmentData) => {
          const newAsn = { ...assignmentData, id: Date.now() };

          setClasses(prevClasses => {
            const newClasses = prevClasses.map(c => {
              // Use String conversion to be 100% sure the IDs match
              if (String(c.id) === String(activeClass.id)) {
                return {
                  ...c,
                  assignments: [...(c.assignments || []), newAsn]
                };
              }
              return c;
            });
            console.log("Teacher just updated classes. New count:", newClasses);
            return newClasses;
          });

          setIsAssignmentStudioOpen(false);
        }}
      />
    );
  }
  // Handle /reset/:token and /confirm/:token
  const hashRoute = getHashRoute();
  if (hashRoute.page === 'reset') {
    return <PasswordResetPage token={hashRoute.token} onSuccess={() => { window.location.hash = ''; }} />;
  }
  if (hashRoute.page === 'confirm') {
    return <ConfirmAccountPage token={hashRoute.token} onSuccess={() => { window.location.hash = ''; }} />;
  }
if (!user) return <LandingPage onLoginSuccess={onLoginSuccess} classes={classes} setClasses={setClasses} />;


  // Profile modal
  if (showProfile) {
    return <ProfileModal user={user} onSave={async (data) => {
      try {
        const result = await api.updateProfile({ ...data, id: user.id });
        if (result && result.user) {
          setUser(u => ({ ...u, ...result.user }));
          localStorage.setItem('class123_logged_in', JSON.stringify({ ...user, ...result.user }));
        } else {
          setUser(u => ({ ...u, ...data }));
          localStorage.setItem('class123_logged_in', JSON.stringify({ ...user, ...data }));
        }
        setShowProfile(false);
      } catch (err) {
        let msg = 'Failed to update profile.';
        if (err?.body) {
          try {
            const body = typeof err.body === 'string' ? JSON.parse(err.body) : err.body;
            if (body.error === 'not_found') msg = 'User not found. Please log in again.';
            else msg = body.error || body.message || 'Failed to update profile.';
          } catch {
            msg = typeof err.body === 'string' ? err.body : err.message || 'Failed to update profile.';
          }
        } else if (err?.message) {
          msg = err.message;
        }
        alert(msg);
      }
    }} onClose={() => setShowProfile(false)} />;
  }

  // Portal (list of classes)
  if (view === 'portal') {
    return (
      <TeacherPortal
        user={user}
        classes={classes}
        onSelectClass={onSelectClass}
        onAddClass={(c) => onAddClass(c)}
        onLogout={onLogout}
        onEditProfile={() => setShowProfile(true)}
        updateClasses={setClasses}
      />
    );
  }

  // Dashboard for a selected class
  if (view === 'dashboard' && activeClass) {
    return (
      <>
        <ClassDashboard
          user={user}
          activeClass={activeClass}
          behaviors={behaviors}
          onBack={() => { setActiveClassId(null); setView('portal'); }}
          onOpenEggRoad={() => setView('egg')}
          onOpenSettings={() => setView('settings')}
          updateClasses={updateClasses}
          onUpdateBehaviors={(next) => setBehaviors(next)}
          onOpenAssignments={() => setIsAssignmentStudioOpen(true)}
        />

        {/* Help icon - floating ? button or searchable guide */}
        {user && (
          <>
            {!showOnboarding && !localStorage.getItem(`class123_onboarding_${user.email}`) ? (
              <HelpIcon onClick={() => {
                setShowOnboarding(true);
              }} />
            ) : (
              <HelpIcon onClick={() => {
                setShowGuide(true);
              }} />
            )}
          </>
        )}

        {showOnboarding && user && (
          <OnboardingGuide
            view="dashboard"
            onComplete={() => {
              setShowOnboarding(false);
              localStorage.setItem(`class123_onboarding_${user.email}`, 'true');
            }}
          />
        )}

        {showGuide && user && !showOnboarding && (
          <SearchableGuide
            /* If we are on the dashboard AND the active class has 'isViewingReports' true,
               show the "reports" guide. Otherwise, show the default "view".
            */
            view={(view === 'dashboard' && activeClass?.isViewingReports) ? 'reports' : view}
            onClose={() => setShowGuide(false)}
          />
        )}
      </>
    );
  }

  if (view === 'egg' && activeClass) {
    return (
      <EggRoad
        classData={activeClass}
        onBack={() => setView('dashboard')}
        onResetProgress={() => {
          // Reset all students' points to 0
          const updated = (prev) => prev.map(c =>
            c.id === activeClass.id
              ? { ...c, students: c.students.map(s => ({ ...s, score: 0 })) }
              : c
          );
          setClasses(updated);
        }}
      />
    );
  }

  if (view === 'settings' && activeClass) {
    return (
      <SettingsPage
        activeClass={activeClass}
        behaviors={behaviors}
        onBack={() => setView('dashboard')}
        onUpdateBehaviors={(next) => setBehaviors(next)}
        onUpdateStudents={(nextStudents) => updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, students: nextStudents } : c))}
      />
    );
  }

  if (view === 'setup') {
    return (
      <SetupWizard onComplete={(newStudents, className) => {
        const newClass = { id: Date.now(), name: className || 'New Class', students: newStudents };
        onAddClass(newClass);
        setView('portal');
      }} />
    );
  }
  // 2. In your render logic:

  // Fallback to portal
  return (
    <>
      <TeacherPortal classes={classes} onSelectClass={onSelectClass} onAddClass={onAddClass} onLogout={onLogout} />

      {/* Help icon - floating ? button or searchable guide */}
      {user && (
        <>
          {!showOnboarding && !localStorage.getItem(`class123_onboarding_${user.email}`) ? (
            <HelpIcon onClick={() => {
              setShowOnboarding(true);
            }} />
          ) : (
            <HelpIcon onClick={() => {
              setShowGuide(true);
            }} />
          )}
        </>
      )}

      {showOnboarding && user && (
        <OnboardingGuide
          view="portal"
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem(`class123_onboarding_${user.email}`, 'true');
          }}
        />
      )}

      {showGuide && user && !showOnboarding && (
        <SearchableGuide
          view="portal"
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
}

// --- STYLES ---
const modernStyles = {
  container: { height: '100vh', background: '#fff', fontFamily: 'system-ui', overflowY: 'auto' },
  glow: { position: 'fixed', top: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% -20%, #e8f5e9, transparent)', pointerEvents: 'none' },
  nav: { padding: '20px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' },
  badge: { fontSize: '10px', background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '10px', verticalAlign: 'middle' },
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
  anchor: { textDecoration: 'none', color: '#444', fontWeight: '500' },
  loginBtn: { background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  signupBtn: { background: '#1a1a1b', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  hero: { textAlign: 'center', padding: '100px 20px' },
  tagline: { color: '#4CAF50', fontWeight: 'bold', marginBottom: '15px' },
  heroTitle: { fontSize: '75px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-3px' },
  gradientText: { background: 'linear-gradient(90deg, #4CAF50, #2E7D32)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: '20px', color: '#666', maxWidth: '600px', margin: '20px auto' },
  mainCta: { background: '#000', color: '#fff', padding: '18px 35px', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' },
  infoSection: { padding: '80px', background: '#f9f9f9' },
  sectionHeading: { textAlign: 'center', fontSize: '40px', fontWeight: '900', marginBottom: '50px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' },
  infoCard: { background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  iconBg: { width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  howSection: { padding: '80px', display: 'flex', gap: '50px', alignItems: 'center' },
  howContent: { flex: 1 },
  step: { display: 'flex', gap: '20px', marginBottom: '30px' },
  stepNum: { minWidth: '40px', height: '40px', background: '#4CAF50', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  howVisual: { flex: 1, height: '350px', background: '#eee', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mockupCard: { background: '#fff', padding: '20px 40px', borderRadius: '15px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  bentoContainer: { width: '700px', background: '#fff', padding: '50px', borderRadius: '35px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
  bentoCard: { background: '#f5f5f7', padding: '30px', borderRadius: '25px', cursor: 'pointer', textAlign: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px' }
};

const styles = {
  lobbyContainer: { padding: '60px', background: '#F4F1EA', minHeight: '100vh' },
  heroTitle: { fontSize: '2.5rem', fontWeight: '900' },
  logoutBtn: { padding: '10px 15px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  classCard: { background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', cursor: 'pointer' },
  addClassCard: { border: '2px dashed #ccc', borderRadius: '30px', height: '180px', cursor: 'pointer', background: 'transparent' },
  appLayout: { display: 'flex', height: '100vh', background: '#F4F1EA' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '40px' },
  header: { padding: '20px 40px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  groupBtn: { background: '#4CAF50', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  eggTrack: { width: '200px', height: '12px', background: '#eee', borderRadius: '10px', position: 'relative' },
  eggFill: { height: '100%', background: '#4CAF50', borderRadius: '10px' },
  eggIcon: { position: 'absolute', top: '-15px', fontSize: '1.5rem' },
  eggCounter: { position: 'absolute', top: '15px', fontSize: '10px', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: '40px', right: '40px', width: '60px', height: '60px', borderRadius: '50%', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: 'white', padding: '40px', borderRadius: '30px', width: '400px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  avatarPickerContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  mainAvatarPreview: { width: '100px', height: '100px', borderRadius: '50%', background: '#f0f0f0', position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: '#fff', padding: '5px', borderRadius: '50%', cursor: 'pointer' },
  genderToggle: { display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '5px', marginBottom: '20px' },
  genderActive: { flex: 1, background: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold' },
  genderInactive: { flex: 1, background: 'transparent', border: 'none', padding: '8px', color: '#888' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '15px' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
  bigCardOverlay: { position: 'fixed', inset: 0, background: '#fff', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigCardContent: { textAlign: 'center' },
  bigCardAvatar: { width: '250px', borderRadius: '50%' }
};

function getHashRoute() {
  if (window.location.hash.startsWith('#/reset/')) {
    return { page: 'reset', token: window.location.hash.replace('#/reset/', '') };
  }
  if (window.location.hash.startsWith('#/confirm/')) {
    return { page: 'confirm', token: window.location.hash.replace('#/confirm/', '') };
  }
  return { page: null };
}

export default App;