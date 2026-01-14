import React, { useState } from 'react';
import { 
  X, ArrowRight, Trophy, ShieldCheck, Zap, GraduationCap, 
  Heart, BookOpen, ChevronLeft, Star, Layout, Users, 
  BarChart3, Dices, Settings, Ghost
} from 'lucide-react';
import api from '../services/api';
import ReportsPage from './ReportsPage';
import StudentWorksheetSolver from './StudentWorksheetSolver';

// --- SUB-COMPONENT: ACCESS CODE PORTAL ---
const AccessCodePortal = ({ type, onBack, classes, setClasses }) => {
  const [accessCode, setAccessCode] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const [activeWorksheet, setActiveWorksheet] = useState(null);

const handleLogin = async (e) => {
  e.preventDefault();
  setError(''); // Clear previous errors
  if (accessCode.length < 5) return setError('Enter 5-digit code.');
  setLoading(true);

  try {
    // 1. First, look for the student in your LOCAL classes prop (The reliable way)
    let foundStudent = null;
    let foundClass = null;

    classes.forEach(c => {
      const student = c.students?.find(s => s.accessCode === accessCode);
      if (student) {
        foundStudent = student;
        foundClass = c;
      }
    });

    if (foundStudent) {
      setStudentData({
        studentId: foundStudent.id,
        studentName: foundStudent.name,
        score: foundStudent.score || 0,
        classData: foundClass // This now has the assignments!
      });
      setLoading(false);
      return; // Stop here, we found them!
    }

    // 2. If not found locally, try the API (Original logic)
    const data = await api.getStudentByCode(accessCode, type);
    if (data) {
      setStudentData(data);
    } else {
      setError(`Invalid ${type} code.`);
    }
  } catch (err) {
    // If the API fails but we didn't find them locally, show the error
    setError('Student not found in any class.'); 
  } finally {
    setLoading(false);
  }
};
// if (studentData) {
//     // If a student clicks 'Start', show the Solver instead of the Dashboard
//     if (activeWorksheet) {
//       return (
//         <StudentWorksheetSolver 
//           worksheet={activeWorksheet} 
//           onClose={() => setActiveWorksheet(null)} 
//           studentName={studentData.studentName}
//         />
//       );
//     }

//     return (
//       <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '50px' }}>
//         {/* Navbar */}
//         <div style={modernStyles.portalNav}>
//           <button onClick={() => setStudentData(null)} style={modernStyles.backBtn}>
//             <ChevronLeft size={18} /> Logout
//           </button>
//           <div style={modernStyles.portalNavInfo}>
//             <span style={{ fontWeight: 800 }}>{studentData.studentName}</span>
//             <span style={modernStyles.classBadge}>{studentData.classData.name}</span>
//           </div>
//         </div>

//         <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
//           {/* Header / Stats */}
//           <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
//              <div style={modernStyles.statCard}>
//                 <Star color="#F59E0B" fill="#F59E0B" />
//                 <div>
//                   <div style={modernStyles.statVal}>{studentData.score || 0}</div>
//                   <div style={modernStyles.statLabel}>Total Points</div>
//                 </div>
//              </div>
//           </div>

//           {/* --- ASSIGNMENTS SECTION --- */}
//           <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '20px', color: '#1E293B' }}>My Live Worksheets</h3>
          
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
//             {studentData.classData.assignments?.map((asn) => (
//               <div key={asn.id} style={modernStyles.assignmentCard}>
//                 <div style={modernStyles.asnIcon}><BookOpen color="#6366F1" /></div>
//                 <div style={{ flex: 1 }}>
//                   <h4 style={{ margin: '0 0 5px 0', fontWeight: 800 }}>{asn.title}</h4>
//                   <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{asn.questions?.length} Questions</p>
//                 </div>
//                 <button 
//                   onClick={() => setActiveWorksheet(asn)}
//                   style={modernStyles.startBtn}
//                 >
//                   Start
//                 </button>
//               </div>
//             ))}
            
//             {(!studentData.classData.assignments || studentData.classData.assignments.length === 0) && (
//               <div style={modernStyles.emptyState}>No assignments yet! 🎉</div>
//             )}
//           </div>

//           {/* Progress Report Section */}
//           {/* <div style={{ marginTop: '50px' }}>
//             <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '20px', color: '#1E293B' }}>Progress Report</h3>
//             <ReportsPage activeClass={studentData.classData} studentId={studentData.studentId} isParentView={true} />
//           </div> */}
//         </div>
//       </div>
//     );
//   }
// Inside AccessCodePortal component
if (studentData) {
    // 1. ALWAYS find the most up-to-date class data from the global 'classes' prop
    // This ensures that when a teacher publishes, the student sees it immediately.
    // Use normalized ID comparison to handle string/number mismatches
    const normalizeStudentId = (id) => {
      if (id === undefined || id === null) return '';
      return String(id).trim();
    };
    
    const liveClassData = classes?.find(c => 
      c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(studentData.studentId))
    ) || studentData.classData;

    // Filter assignments to only show those assigned to this student
    // If assignedTo is 'all' or if the student is in the selected list
    const studentAssignments = liveClassData?.assignments?.filter(assignment => {
      // If assignedToAll is true, all students can see it
      if (assignment.assignedToAll === true || assignment.assignedTo === 'all') {
        return true;
      }
      // If specific students are assigned, check if current student is in the list
      // Handle potential type mismatches (string vs number IDs) and normalization
      if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
        const normalizedStudentId = normalizeStudentId(studentData.studentId);
        return assignment.assignedTo.some(id => normalizeStudentId(id) === normalizedStudentId);
      }
      // Default: show the assignment
      return true;
    }) || [];

    // Force a re-render when assignments change by using a key that depends on the assignments
    const assignmentsKey = JSON.stringify(studentAssignments.map(a => a.id));

    // 2. If a student is currently doing a worksheet, show the Solver
    if (activeWorksheet) {
      return (
        <StudentWorksheetSolver 
          worksheet={activeWorksheet} 
          onClose={() => setActiveWorksheet(null)} 
          studentName={studentData.studentName}
          studentId={studentData.studentId}
          classId={liveClassData?.id}
          classes={classes}
          setClasses={setClasses}
        />
      );
    }

    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '50px' }}>
        {/* Navbar */}
        <div style={modernStyles.portalNav}>
          <button onClick={() => { setStudentData(null); setPortalView(null); }} style={modernStyles.backBtn}>
            <ChevronLeft size={18} /> Back to Home
          </button>
          <div style={modernStyles.portalNavInfo}>
            <span style={{ fontWeight: 800 }}>{studentData.studentName}</span>
            <span style={modernStyles.classBadge}>{liveClassData?.name || 'Class'}</span>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
          {/* STAT CARDS */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
             <div style={modernStyles.statCard}>
                <Star color="#F59E0B" fill="#F59E0B" />
                <div>
                  <div style={modernStyles.statVal}>{studentData.score || 0}</div>
                  <div style={modernStyles.statLabel}>Total Points</div>
                </div>
             </div>
          </div>

          {/* --- ASSIGNMENTS SECTION (The fix is here) --- */}
          <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '20px', color: '#1E293B' }}>My Live Worksheets</h3>
          
          <div key={assignmentsKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {studentAssignments.map((asn) => (
              <div key={asn.id} style={modernStyles.assignmentCard}>
                <div style={modernStyles.asnIcon}><BookOpen color="#6366F1" /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontWeight: 800 }}>{asn.title}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{asn.questions?.length || 0} Questions</p>
                </div>
                <button 
                  onClick={() => setActiveWorksheet(asn)}
                  style={modernStyles.startBtn}
                >
                  Start
                </button>
              </div>
            ))}
            
            {(studentAssignments.length === 0) && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
                <p style={{ color: '#64748B', fontWeight: 600 }}>No assignments yet! Keep it up. 🌟</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={modernStyles.portalContainer}>
      <div style={modernStyles.glassCard}>
        <div style={{ ...modernStyles.iconCircle, background: type === 'parent' ? '#FFF5F5' : '#E0F2F1' }}>
          {type === 'parent' ? <Heart size={30} color="#FF5252" /> : <BookOpen size={30} color="#009688" />}
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '24px', margin: '10px 0' }}>{type === 'parent' ? 'Parent' : 'Student'} Portal</h2>
        <p style={{ color: '#64748B', marginBottom: '25px' }}>Enter your 5-digit access code.</p>
        <form onSubmit={handleLogin} style={modernStyles.authForm}>
          <input 
            type="text" 
            maxLength={5}
            style={modernStyles.codeField}
            placeholder="•••••"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.replace(/[^0-9]/g, ''))}
          />
          {error && <p style={modernStyles.errorMsg}>{error}</p>}
          <button type="submit" disabled={loading} style={modernStyles.mainCta}>
            {loading ? 'Verifying...' : 'View Dashboard'}
          </button>
          <button type="button" onClick={onBack} style={modernStyles.ghostBtn}>Back to Home</button>
        </form>
      </div>
    </div>
  );
};

export default function LandingPage({ onLoginSuccess, classes, setClasses }) {
  const [modalMode, setModalMode] = useState(null); 
  const [portalView, setPortalView] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    try {
      await api.register({ email, password, name });
      setModalMode('login');
      setError('Account created! Please login.');
    } catch (err) { setError(err.message); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.login({ email, password });
      if (resp.token) {
        api.setToken(resp.token);
        onLoginSuccess({ ...resp.user, token: resp.token });
      }
    } catch (err) { setError(err.message); }
  };

  if (portalView) return <AccessCodePortal type={portalView} onBack={() => setPortalView(null)} classes={classes} setClasses={setClasses} />;

  return (
    <div style={modernStyles.container}>
      <div style={modernStyles.meshBackground}></div>

      {/* --- NAVBAR --- */}
      <nav style={modernStyles.nav}>
        <div style={modernStyles.logo}>ClassABC <span style={modernStyles.logoTag}>V.26</span></div>
        <div style={modernStyles.navActions}>
          <button onClick={() => setModalMode('role')} style={modernStyles.loginLink}>Login</button>
          <button onClick={() => setModalMode('signup')} style={modernStyles.signupBtn}>Get Started Free</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section style={modernStyles.heroSection}>
        <div style={modernStyles.heroContent}>
          <div style={modernStyles.tagBadge}>
            <Star size={14} fill="#4CAF50" color="#4CAF50" /> 
            Trusted by Modern Teachers
          </div>
          <h1 style={modernStyles.heroTitle}>
            Classroom management <br/>
            <span style={modernStyles.gradientText}>made magical.</span>
          </h1>
          <p style={modernStyles.heroSubText}>
            The all-in-one platform for behavior tracking, gamified "Egg Road" goals, 
            and instant parent communication.
          </p>
          <div style={modernStyles.heroBtnGroup}>
            <button onClick={() => setModalMode('signup')} style={modernStyles.mainCta}>
              Create My Class <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* --- LIVE APP SIMULATOR (CSS Composition) --- */}
        <div style={modernStyles.mockupWrapper}>
          <div style={modernStyles.appWindow}>
            {/* Sidebar Simulation */}
            <div style={modernStyles.appSidebar}>
              <div style={modernStyles.sidebarIconActive}><Layout size={20} /></div>
              <div style={modernStyles.sidebarIcon}><Trophy size={20} /></div>
              <div style={modernStyles.sidebarIcon}><Settings size={20} /></div>
            </div>
            {/* Main Content Simulation */}
            <div style={modernStyles.appContent}>
              <div style={modernStyles.appHeader}>
                <span style={{fontWeight:800}}>Class 4-B</span>
                <div style={modernStyles.eggRoadBar}>
                  <div style={modernStyles.eggFill}></div>
                  <span style={modernStyles.eggText}>🥚 Egg Road: 85%</span>
                </div>
              </div>
              <div style={modernStyles.appGrid}>
                {/* Simulated Student Cards */}
                {['Pablo', 'Marie', 'Albert', 'Frida', 'Leo', 'Ada'].map((name, i) => (
                  <div key={i} style={modernStyles.appCard}>
                    <div style={modernStyles.appAvatar}>{name[0]}</div>
                    <div style={modernStyles.appName}>{name}</div>
                    <div style={modernStyles.appScore}>+{(i + 2) * 3}</div>
                  </div>
                ))}
              </div>
              {/* Floating Action Button Simulation */}
              <div style={modernStyles.appFab}><Dices size={20} /></div>
            </div>
          </div>
          {/* Decorative Elements behind mockup */}
          <div style={modernStyles.blob1}></div>
          <div style={modernStyles.blob2}></div>
        </div>
      </section>

      {/* --- FEATURES BENTO GRID --- */}
      <section style={modernStyles.section}>
        <div style={modernStyles.sectionHeader}>
          <h2 style={modernStyles.sectionTitle}>Everything you need to run your class.</h2>
          <p style={modernStyles.sectionSub}>We've packed ClassABC with tools to make your day easier.</p>
        </div>
        
        <div style={modernStyles.bentoGrid}>
          {/* Egg Road Feature */}
          <div style={{...modernStyles.bentoCard, gridColumn: 'span 2', background: 'linear-gradient(135deg, #F0FDF4 0%, #fff 100%)'}}>
            <div style={modernStyles.iconBoxGreen}><Trophy size={28} color="#16A34A" /></div>
            <h3>The Egg Road</h3>
            <p style={modernStyles.bentoText}>Gamify good behavior! The whole class works together to fill the progress bar and hatch a surprise egg. Builds teamwork instantly.</p>
          </div>

          {/* Lucky Draw Feature */}
          <div style={modernStyles.bentoCard}>
            <div style={modernStyles.iconBoxOrange}><Dices size={28} color="#EA580C" /></div>
            <h3>Lucky Draw</h3>
            <p style={modernStyles.bentoText}>Need a volunteer? Pick a student at random fairly and quickly with our built-in selector.</p>
          </div>

          {/* Reports Feature */}
          <div style={modernStyles.bentoCard}>
            <div style={modernStyles.iconBoxBlue}><BarChart3 size={28} color="#2563EB" /></div>
            <h3>Smart Reports</h3>
            <p style={modernStyles.bentoText}>Automated weekly summaries help you spot trends and share progress with parents easily.</p>
          </div>

          {/* Safe Avatars Feature */}
          <div style={{...modernStyles.bentoCard, gridColumn: 'span 2', background: 'linear-gradient(135deg, #EFF6FF 0%, #fff 100%)'}}>
            <div style={modernStyles.iconBoxPurple}><Ghost size={28} color="#7C3AED" /></div>
            <h3>Fun & Safe Avatars</h3>
            <p style={modernStyles.bentoText}>Every student gets a unique, privacy-friendly avatar. No photos required, just fun characters that students love.</p>
          </div>
        </div>
      </section>

      {/* --- REDESIGNED DARK SECTION (How it Works) --- */}
      <section style={modernStyles.darkSection}>
        <div style={modernStyles.darkInner}>
          <h2 style={modernStyles.darkTitle}>Get started in 3 minutes.</h2>
          <div style={modernStyles.stepsRow}>
            <div style={modernStyles.stepCard}>
              <div style={modernStyles.stepNum}>01</div>
              <h4 style={modernStyles.stepTitle}>Create Class</h4>
              <p style={modernStyles.stepDesc}>Name your class and paste your student list. We generate avatars automatically.</p>
            </div>
            <div style={modernStyles.stepConnector}><ArrowRight color="rgba(255,255,255,0.2)" /></div>
            <div style={modernStyles.stepCard}>
              <div style={modernStyles.stepNum}>02</div>
              <h4 style={modernStyles.stepTitle}>Track Points</h4>
              <p style={modernStyles.stepDesc}>Give "Wow" points for good work or "No-no" points for improvements.</p>
            </div>
            <div style={modernStyles.stepConnector}><ArrowRight color="rgba(255,255,255,0.2)" /></div>
            <div style={modernStyles.stepCard}>
              <div style={modernStyles.stepNum}>03</div>
              <h4 style={modernStyles.stepTitle}>Share Access</h4>
              <p style={modernStyles.stepDesc}>Send 5-digit codes to parents so they can view reports from home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section style={modernStyles.ctaSection}>
        <h2 style={{fontSize: '36px', fontWeight: 900, marginBottom: '20px'}}>Ready to upgrade your classroom?</h2>
        <button onClick={() => setModalMode('signup')} style={modernStyles.mainCta}>
          Join ClassABC Today
        </button>
        <p style={{marginTop: '20px', color: '#64748B', fontSize: '14px'}}>© 2026 ClassABC. All rights reserved.</p>
      </section>

      {/* --- AUTH MODAL (Identity Selector) --- */}
      {modalMode && (
        <div style={modernStyles.overlay}>
          <div style={modernStyles.modernModal}>
            <div style={modernStyles.modalHeader}>
              <div>
                <h2 style={{margin:0, fontWeight:900, fontSize:'24px'}}>
                  {modalMode === 'role' ? 'Who are you?' : (modalMode === 'signup' ? 'Teacher Sign Up' : 'Teacher Login')}
                </h2>
                {modalMode === 'role' && <p style={{margin:'5px 0 0', color:'#64748B'}}>Select your portal to continue.</p>}
              </div>
              <div onClick={() => setModalMode(null)} style={modernStyles.closeBtn}><X size={20}/></div>
            </div>

            {modalMode === 'role' && (
              <div style={modernStyles.roleGrid}>
                <div onClick={() => setModalMode('login')} style={modernStyles.roleOption}>
                  <div style={{...modernStyles.roleIcon, background: '#E8F5E9'}}><GraduationCap color="#4CAF50"/></div>
                  <div>
                    <h4 style={{margin:0, fontSize:'16px'}}>Teacher</h4>
                    <p style={{margin:0, fontSize:'13px', color:'#64748B'}}>Login to dashboard</p>
                  </div>
                </div>
                <div onClick={() => setPortalView('parent')} style={modernStyles.roleOption}>
                  <div style={{...modernStyles.roleIcon, background: '#FFF1F2'}}><Heart color="#FF5252"/></div>
                  <div>
                    <h4 style={{margin:0, fontSize:'16px'}}>Parent</h4>
                    <p style={{margin:0, fontSize:'13px', color:'#64748B'}}>View child's report</p>
                  </div>
                </div>
                <div onClick={() => setPortalView('student')} style={modernStyles.roleOption}>
                  <div style={{...modernStyles.roleIcon, background: '#E0F2F1'}}><BookOpen color="#009688"/></div>
                  <div>
                    <h4 style={{margin:0, fontSize:'16px'}}>Student</h4>
                    <p style={{margin:0, fontSize:'13px', color:'#64748B'}}>Check your points</p>
                  </div>
                </div>
              </div>
            )}

            {(modalMode === 'signup' || modalMode === 'login') && (
              <form onSubmit={modalMode === 'signup' ? handleSignup : handleLogin} style={modernStyles.authForm}>
                {error && <div style={modernStyles.errorBanner}>{error}</div>}
                {modalMode === 'signup' && <input placeholder="Full Name" style={modernStyles.modernInput} onChange={e => setName(e.target.value)} required />}
                <input type="email" placeholder="Email Address" style={modernStyles.modernInput} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" style={modernStyles.modernInput} onChange={e => setPassword(e.target.value)} required />
                {modalMode === 'signup' && <input type="password" placeholder="Confirm Password" style={modernStyles.modernInput} onChange={e => setConfirmPassword(e.target.value)} required />}
                
                <button type="submit" style={{...modernStyles.mainCta, width:'100%', justifyContent:'center'}}>
                  {modalMode === 'signup' ? 'Create Free Account' : 'Login to Class'}
                </button>
                
                <p style={{textAlign:'center', fontSize: '13px', color:'#64748B', marginTop:'15px'}}>
                  {modalMode === 'signup' ? "Already have an account?" : "New here?"} 
                  <span onClick={() => setModalMode(modalMode === 'signup' ? 'login' : 'signup')} style={{color:'#16A34A', cursor:'pointer', fontWeight: 800, marginLeft:'5px'}}>
                    {modalMode === 'signup' ? 'Login' : 'Create Account'}
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// --- MODERN 2026 STYLES ---
const modernStyles = {
  container: { background: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1A1A1A', overflowX: 'hidden' },
  meshBackground: { position: 'fixed', inset: 0, background: 'radial-gradient(at 0% 0%, rgba(76, 175, 80, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.08) 0, transparent 50%)', zIndex: -1 },
  
  // Nav
  nav: { padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.04)' },
  logo: { fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' },
  logoTag: { background: '#1A1A1A', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', marginLeft: '8px', fontWeight: 700 },
  navActions: { display: 'flex', gap: '20px', alignItems: 'center' },
  loginLink: { background: 'none', border: 'none', fontWeight: 700, color: '#4B5563', cursor: 'pointer', fontSize: '15px' },
  signupBtn: { background: '#1A1A1A', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', transition: 'transform 0.2s' },

  // Hero
  heroSection: { display: 'flex', alignItems: 'center', gap: '60px', padding: '80px 60px', maxWidth: '1400px', margin: '0 auto', minHeight: '600px' },
  heroContent: { flex: 1 },
  tagBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#15803D', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, marginBottom: '25px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.1)' },
  heroTitle: { fontSize: '72px', fontWeight: 950, lineHeight: 1, letterSpacing: '-2px', margin: 0, color: '#0F172A' },
  gradientText: { background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubText: { fontSize: '18px', color: '#64748B', maxWidth: '520px', margin: '30px 0', lineHeight: 1.6 },
  heroBtnGroup: { display: 'flex', gap: '15px' },
  
  // App Simulator (CSS Only)
  mockupWrapper: { flex: 1.2, position: 'relative', display: 'flex', justifyContent: 'center' },
  appWindow: { width: '100%', maxWidth: '650px', height: '400px', background: '#fff', borderRadius: '24px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 },
  appSidebar: { width: '70px', background: '#F8FAFC', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px' },
  sidebarIconActive: { color: '#16A34A', background: '#DCFCE7', padding: '10px', borderRadius: '12px' },
  sidebarIcon: { color: '#94A3B8', padding: '10px' },
  appContent: { flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' },
  appHeader: { padding: '15px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  eggRoadBar: { background: '#F0FDF4', padding: '6px 15px', borderRadius: '20px', width: '200px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' },
  eggFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '85%', background: '#4CAF50', opacity: 0.2 },
  eggText: { fontSize: '11px', fontWeight: 800, color: '#15803D', zIndex: 1, width: '100%', textAlign: 'center' },
  appGrid: { padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', overflow: 'hidden' },
  appCard: { border: '1px solid #E2E8F0', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  appAvatar: { width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' },
  appName: { fontSize: '12px', fontWeight: 700 },
  appScore: { background: '#DCFCE7', color: '#15803D', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' },
  appFab: { position: 'absolute', bottom: '20px', right: '20px', width: '50px', height: '50px', background: '#1A1A1A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
  blob1: { position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, #BBF7D0 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, opacity: 0.6 },
  blob2: { position: 'absolute', bottom: '-50px', left: '0px', width: '250px', height: '250px', background: 'radial-gradient(circle, #BFDBFE 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, opacity: 0.6 },

  // Bento
  section: { padding: '100px 60px', maxWidth: '1300px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '60px' },
  sectionTitle: { fontSize: '42px', fontWeight: 900, marginBottom: '15px' },
  sectionSub: { fontSize: '18px', color: '#64748B' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' },
  bentoCard: { background: '#fff', border: '1px solid #E2E8F0', padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default' },
  iconBoxGreen: { width: '60px', height: '60px', background: '#DCFCE7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxOrange: { width: '60px', height: '60px', background: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxBlue: { width: '60px', height: '60px', background: '#DBEAFE', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxPurple: { width: '60px', height: '60px', background: '#F3E8FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  bentoText: { fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginTop: '10px' },

  // Dark Section
  darkSection: { margin: '20px 20px 80px', background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', borderRadius: '40px', padding: '100px 40px', color: '#fff', position: 'relative', overflow: 'hidden' },
  darkInner: { maxWidth: '1100px', margin: '0 auto' },
  darkTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', background: 'linear-gradient(90deg, #fff, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  stepsRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' },
  stepCard: { flex: 1, background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
  stepNum: { fontSize: '12px', fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', color: '#4CAF50' },
  stepTitle: { fontSize: '20px', fontWeight: 800, marginBottom: '10px' },
  stepDesc: { fontSize: '15px', color: '#94A3B8', lineHeight: 1.6 },
  stepConnector: { marginTop: '50px' },
  
  // CTA
  ctaSection: { textAlign: 'center', padding: '0 20px 100px' },
  mainCta: { background: '#1A1A1A', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },

  // Portal & Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modernModal: { width: '480px', background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  closeBtn: { padding: '8px', background: '#F1F5F9', borderRadius: '50%', cursor: 'pointer' },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  roleOption: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderRadius: '20px', background: '#fff', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
  roleIcon: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  modernInput: { padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', outline: 'none' },
  errorBanner: { background: '#FEF2F2', color: '#EF4444', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textAlign: 'center' },
  
  portalContainer: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' },
  glassCard: { width: '400px', background: '#fff', padding: '50px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' },
  iconCircle: { width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
  codeField: { fontSize: '40px', width: '100%', textAlign: 'center', border: 'none', fontWeight: 900, letterSpacing: '8px', marginBottom: '20px', color: '#1A1A1A' },
  ghostBtn: { background: 'none', border: 'none', marginTop: '15px', color: '#64748B', fontWeight: 700, cursor: 'pointer' },
  errorMsg: { color: '#EF4444', fontSize: '13px', fontWeight: 700, marginBottom: '10px' },
  
  portalNav: { padding: '20px 40px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '20px' },
  classBadge: { background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginLeft: '10px' },
  backBtn: { background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }
,statCard: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #E2E8F0', minWidth: '200px' },
  statVal: { fontSize: '24px', fontWeight: 900, color: '#1E293B' },
  statLabel: { fontSize: '12px', color: '#64748B', fontWeight: 600 },
  assignmentCard: { background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  asnIcon: { background: '#EEF2FF', padding: '12px', borderRadius: '14px' },
  startBtn: { background: '#4F46E5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748B', fontWeight: 600, background: '#F1F5F9', borderRadius: '24px' }
};
