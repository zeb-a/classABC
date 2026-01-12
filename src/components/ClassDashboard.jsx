import React, { useEffect, useState } from 'react';
import {
  Dices, Trophy, Settings, Home, UserPlus, Camera,
  ChevronLeft, ChevronRight, Sliders, ChevronDown,
  CheckSquare, BarChart2, QrCode, ClipboardList, Inbox,
  Plus, Send, CheckCircle, X
} from 'lucide-react';
import ReportsPage from './ReportsPage';
import StudentCard from './StudentCard';
import BehaviorModal from './BehaviorModal';
import LuckyDrawModal from './LuckyDrawModal';
import AddStudentModal from './AddStudentModal';
import SafeAvatar from './SafeAvatar';
import { PointAnimation } from './PointAnimation';
import { boringAvatar, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';


// --- SUB-COMPONENT: MESSAGES/GRADING VIEW ---
const MessagesView = ({ activeClass, submissions, onGrade, onClose }) => {
  const pending = submissions.filter(s => s.status === 'submitted');
  const graded = submissions.filter(s => s.status === 'graded');

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 900 }}>Inbox & Grading</h2>
        <button onClick={onClose} style={styles.secondaryBtn}>Back to Dashboard</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* PENDING COLUMN */}
        <div>
          <h3 style={styles.columnTitle}>Needs Grading ({pending.length})</h3>
          {pending.length === 0 && <div style={styles.emptyState}>All caught up!</div>}
          {pending.map(sub => {
            const student = activeClass.students.find(s => s.id === sub.studentId);
            const assignment = activeClass.assignments?.find(a => a.id === sub.assignmentId);
            return (
              <div key={sub.id} style={styles.messageCard}>
                <div style={styles.messageHeader}>
                  <SafeAvatar src={student?.avatar} name={student?.name} style={{ width: 30, height: 30, borderRadius: '50%' }} />
                  <span style={{ fontWeight: 'bold' }}>{student?.name}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>just now</span>
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{assignment?.title}</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                  Student submitted answers.
                </div>
                <button
                  onClick={() => onGrade(sub, student, assignment)}
                  style={styles.gradeBtn}
                >
                  Review & Grade
                </button>
              </div>
            );
          })}
        </div>

        {/* GRADED COLUMN */}
        <div>
          <h3 style={styles.columnTitle}>Recent Activity</h3>
          {graded.map(sub => {
            const student = activeClass.students.find(s => s.id === sub.studentId);
            const assignment = activeClass.assignments?.find(a => a.id === sub.assignmentId);
            return (
              <div key={sub.id} style={{ ...styles.messageCard, opacity: 0.7 }}>
                <div style={styles.messageHeader}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <span style={{ fontWeight: 'bold' }}>Graded: {student?.name}</span>
                </div>
                <div style={{ fontSize: '14px' }}>{assignment?.title}</div>
                <div style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 'bold' }}>
                  Awarded {sub.grade} Points
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function ClassDashboard({
  user,
  activeClass,
  behaviors,
  onBack,
  onOpenEggRoad,
  onOpenSettings,
  updateClasses,
  onUpdateBehaviors,
  onOpenAssignments
}) {
  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentAvatar, setEditStudentAvatar] = useState(null);
  const [editSelectedSeed, setEditSelectedSeed] = useState(null);
  const [showEditAvatarPicker, setShowEditAvatarPicker] = useState(false);
  const [hoveredEditChar, setHoveredEditChar] = useState(null);
  const [deleteConfirmStudentId, setDeleteConfirmStudentId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [displaySize, setDisplaySize] = useState('big');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showClassBehaviorModal, setShowClassBehaviorModal] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showPoint, setShowPoint] = useState({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' });
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [absentStudents, setAbsentStudents] = useState(new Set());
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [showCodesPage, setShowCodesPage] = useState(false);

  // --- NEW STATES FOR ASSIGNMENTS & MESSAGES ---
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'assignments', 'messages'
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState(5); // Default points

  const generate5DigitCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  // Calculate unread messages
  const submissions = activeClass.submissions || [];
  const unreadCount = submissions.filter(s => s.status === 'submitted').length;

  useEffect(() => {
    if (!showGridMenu) return;
    const t = setTimeout(() => setShowGridMenu(false), 2000);
    return () => clearTimeout(t);
  }, [showGridMenu]);

  const ensureCodesAndOpen = () => {
    const currentAccessCodes = typeof activeClass.Access_Codes === 'object' && activeClass.Access_Codes !== null
      ? activeClass.Access_Codes
      : {};

    let needsUpdate = false;
    const updatedCodesObject = { ...currentAccessCodes };

    activeClass.students.forEach(s => {
      if (!updatedCodesObject[s.id]) {
        needsUpdate = true;
        updatedCodesObject[s.id] = {
          parentCode: generate5DigitCode(),
          studentCode: generate5DigitCode()
        };
      }
    });

    if (needsUpdate) {
      updateClasses(prev => prev.map(c =>
        c.id === activeClass.id ? { ...c, Access_Codes: updatedCodesObject } : c
      ));
    }
    setShowCodesPage(true);
  };

  // --- ASSIGNMENT LOGIC ---
  const handleCreateAssignment = (newAssignment) => {
    updateClasses(prev => prev.map(c => {
      if (c.id === activeClass.id) {
        return {
          ...c,
          assignments: [...(c.assignments || []), newAssignment]
        };
      }
      return c;
    }));
    setViewMode('dashboard');
    // Simulate a student submission for demo purposes after 3 seconds
    setTimeout(() => simulateStudentSubmission(newAssignment.id), 3000);
  };

  const simulateStudentSubmission = (assignmentId) => {
    // Pick a random student to simulate submission
    const randoStudent = activeClass.students[0];
    if (!randoStudent) return;

    const newSubmission = {
      id: Date.now(),
      assignmentId,
      studentId: randoStudent.id,
      answers: { 1: "Simulated Answer" },
      status: 'submitted',
      timestamp: new Date().toISOString()
    };

    updateClasses(prev => prev.map(c => {
      if (c.id === activeClass.id) {
        return {
          ...c,
          submissions: [...(c.submissions || []), newSubmission]
        };
      }
      return c;
    }));
  };

  // --- GRADING LOGIC ---
  const openGradingModal = (submission, student, assignment) => {
    setCurrentSubmission({ submission, student, assignment });
    setGradingModalOpen(true);
  };

  const submitGrade = () => {
    if (!currentSubmission) return;
    const points = parseInt(gradeInput) || 0;

    // 1. Give Points to Student
    updateClasses(prev => prev.map(c =>
      c.id === activeClass.id ? {
        ...c,
        students: c.students.map(s => {
          if (s.id === currentSubmission.student.id) {
            return {
              ...s,
              score: s.score + points,
              history: [...(s.history || []), {
                label: `Assignment: ${currentSubmission.assignment.title}`,
                pts: points,
                type: 'assignment',
                timestamp: new Date().toISOString()
              }]
            };
          }
          return s;
        }),
        // 2. Update Submission Status
        submissions: c.submissions.map(sub =>
          sub.id === currentSubmission.submission.id
            ? { ...sub, status: 'graded', grade: points }
            : sub
        )
      } : c
    ));

    setGradingModalOpen(false);
    setCurrentSubmission(null);
  };

  // --- EXISTING HANDLERS ---
  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name || '');
    setEditStudentAvatar(student.avatar || null);
    setEditSelectedSeed(null);
  };

  const handleSaveStudentEdit = () => {
    if (!editStudentName.trim()) return;
    const finalAvatar =
      editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : undefined);

    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) =>
              s.id === editingStudentId ? { ...s, name: editStudentName, avatar: finalAvatar } : s
            )
          }
          : c
      )
    );

    setEditingStudentId(null);
    setEditStudentName('');
    setEditStudentAvatar(null);
    setEditSelectedSeed(null);
  };

  const handleDeleteStudent = (student) => {
    updateClasses((prev) =>
      prev.map((c) => {
        if (c.id === activeClass.id) {
          const updatedCodes = { ...(c.Access_Codes || {}) };
          delete updatedCodes[student.id];
          return {
            ...c,
            students: c.students.filter((s) => s.id !== student.id),
            Access_Codes: updatedCodes
          };
        }
        return c;
      })
    );
    setDeleteConfirmStudentId(null);
  };

  const handleGivePoint = (behavior) => {
    if (!selectedStudent) return;
    const today = new Date().toISOString().split('T')[0];
    if (selectedStudent.attendance === 'absent' && selectedStudent.attendanceDate === today) {
      return;
    }
    setShowPoint({ visible: true, student: selectedStudent, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              if (s.id === selectedStudent.id) {
                const newLog = {
                  label: behavior.label,
                  pts: behavior.pts,
                  type: behavior.type,
                  timestamp: new Date().toISOString()
                };
                return {
                  ...s,
                  score: s.score + behavior.pts,
                  history: [...(s.history || []), newLog]
                };
              }
              return s;
            })
          }
          : c
      )
    );
    setSelectedStudent(null);
  };

  const handleGivePointsToClass = (behavior) => {
    setShowPoint({ visible: true, student: { name: 'Whole Class', students: activeClass.students }, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);
    updateClasses((prev) =>
      prev.map((c) => (c.id === activeClass.id ? { ...c, students: c.students.map((s) => ({ ...s, score: s.score + behavior.pts })) } : c))
    );
    setShowClassBehaviorModal(false);
  };

  if (!activeClass) return <div style={styles.layout}>No class selected</div>;

  // --- CONDITIONAL RENDERS FOR VIEWS ---

  if (showReports) {
    return <ReportsPage
      activeClass={activeClass}
      onBack={() => {
        setShowReports(false);
        updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isViewingReports: false } : c));
      }}
    />;
  }

  if (showCodesPage) {
    /* Same Codes Page Logic */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', padding: '40px', minHeight: '100vh', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#2D3436' }}> Student Access Codes</h1>
          <button onClick={() => setShowCodesPage(false)} style={{ ...styles.addBtn, background: '#636E72' }}>Back to Dashboard</button>
        </header>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Student Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Parent Code</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Student Code</th>
              </tr>
            </thead>
            <tbody>
              {activeClass.students.map((s) => {
                const codes = (activeClass.Access_Codes && activeClass.Access_Codes[s.id]) || { parentCode: '---', studentCode: '---' };
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2D3436' }}>{s.name}</td>
                    <td style={{ padding: '16px 24px' }}><span style={{ fontFamily: 'monospace', background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '6px', fontSize: '15px' }}>{codes.parentCode}</span></td>
                    <td style={{ padding: '16px 24px' }}><span style={{ fontFamily: 'monospace', background: '#E3F2FD', color: '#1565C0', padding: '4px 10px', borderRadius: '6px', fontSize: '15px' }}>{codes.studentCode}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.layout}>
        {/* --- SIDEBAR --- */}
        <nav
          style={{
            ...styles.sidebar,
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            zIndex: 1000,
            transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            boxShadow: sidebarVisible ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#2E7D32' }}>
              {(user && (user.name || user.email) || '').charAt(0).toUpperCase()}
            </div>
          </div>
          <Home onClick={() => { onBack(); setViewMode('dashboard'); }} onMouseEnter={() => setHoveredIcon('back')} onMouseLeave={() => setHoveredIcon(null)} style={styles.icon} title="Back" />

          {/* NEW: ASSIGNMENTS ICON */}
          <ClipboardList
            onClick={() => {
              console.log("Triggering App.jsx state...");
              onOpenAssignments(); // This tells App.jsx to show the AssignmentsPage
            }}
            style={styles.icon}
            title="Assignment Studio"
          />
          {/* NEW: MESSAGES ICON WITH BADGE */}
          <div style={{ position: 'relative' }}>
            <Inbox
              onClick={() => setViewMode('messages')}
              onMouseEnter={() => setHoveredIcon('messages')}
              onMouseLeave={() => setHoveredIcon(null)}
              style={{ ...styles.icon, color: viewMode === 'messages' ? '#4CAF50' : '#636E72' }}
              title="Messages & Grading"

            />
            {activeClass.submissions?.filter(s => s.status === 'submitted').length > 0 && (
    <span style={styles.badge}>
      {activeClass.submissions.filter(s => s.status === 'submitted').length}
    </span>
  )}
            {unreadCount > 0 && (
              <div style={styles.badge}>{unreadCount}</div>
            )}
          </div>

          <Dices onClick={() => setIsLuckyDrawOpen(true)} onMouseEnter={() => setHoveredIcon('lucky')} onMouseLeave={() => setHoveredIcon(null)} style={styles.icon} />
          <Trophy onClick={onOpenEggRoad} onMouseEnter={() => setHoveredIcon('egg')} onMouseLeave={() => setHoveredIcon(null)} style={styles.icon} />
          <CheckSquare onClick={() => setIsAttendanceMode(!isAttendanceMode)} onMouseEnter={() => setHoveredIcon('attendance')} onMouseLeave={() => setHoveredIcon(null)} style={{ ...styles.icon, color: isAttendanceMode ? '#4CAF50' : '#666' }} />
          <Settings onClick={onOpenSettings} onMouseEnter={() => setHoveredIcon('settings')} onMouseLeave={() => setHoveredIcon(null)} style={styles.icon} />
          <QrCode onClick={ensureCodesAndOpen} onMouseEnter={() => setHoveredIcon('codes')} onMouseLeave={() => setHoveredIcon(null)} style={styles.icon} />
          <BarChart2 onClick={() => { setShowReports(true); updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isViewingReports: true } : c)); }} onMouseEnter={() => setHoveredIcon('reports')} onMouseLeave={() => setHoveredIcon(null)} style={styles.icon} />

          {/* Tooltips Logic (Simplified) */}
          {hoveredIcon && (
            <div style={{ position: 'absolute', left: '80px', top: '50%', transform: 'translateY(-50%)', background: '#2D3436', color: 'white', padding: '8px 12px', borderRadius: '8px', zIndex: 2000 }}>
              {hoveredIcon.charAt(0).toUpperCase() + hoveredIcon.slice(1)}
            </div>
          )}
        </nav>

        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          style={{ position: 'fixed', left: sidebarVisible ? '80px' : '0', top: '20px', zIndex: 1001, background: 'white', border: 'none', borderRadius: '0 8px 8px 0', width: '28px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}
        >
          {sidebarVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <main style={{ ...styles.content, marginLeft: sidebarVisible ? '80px' : '0', transition: 'margin-left 0.3s ease' }}>

          {/* --- VIEW SWITCHER --- */}
          {viewMode === 'messages' ? (
            <MessagesView
              activeClass={activeClass}
              submissions={activeClass.submissions || []}
              // onGrade={openGradingModal}
              onClose={() => setViewMode('students')}
              onGrade={(subId, gradeData) => {
           // Logic to add points to student and mark as graded
           console.log("Grading submission:", subId, gradeData);
        }}
            />
          ) : (
            <>
              {/* --- STANDARD DASHBOARD VIEW --- */}
              <header style={styles.header}>
                <h2>{activeClass.name} {isAttendanceMode && <span style={{ fontSize: '0.8em', color: '#FF9800', fontWeight: 'bold' }}>- ATTENDANCE MODE</span>}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                  {isAttendanceMode && (
                    <button
                      onClick={() => {
                        updateClasses((prev) => prev.map((c) => c.id === activeClass.id ? { ...c, students: c.students.map((s) => ({ ...s, attendance: absentStudents.has(s.id) ? 'absent' : 'present', attendanceDate: new Date().toISOString().split('T')[0] })) } : c));
                        setIsAttendanceMode(false);
                        setAbsentStudents(new Set());
                      }}
                      style={styles.actionBtn}
                    >
                      ✓ Save Attendance
                    </button>
                  )}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowGridMenu(!showGridMenu)} style={styles.actionBtn}>
                      <Sliders size={18} /> Display
                    </button>
                    {showGridMenu && (
                      <div style={styles.gridMenu}>
                        {[{ size: 'small', label: 'Small' }, { size: 'medium', label: 'Medium' }, { size: 'big', label: 'Big' }].map((option) => (
                          <button key={option.size} onClick={() => { setDisplaySize(option.size); setShowGridMenu(false); }} style={{ ...styles.gridOption, background: displaySize === option.size ? '#4CAF50' : '#f5f5f5', color: displaySize === option.size ? 'white' : '#2D3436' }}>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowClassBehaviorModal(true)} style={styles.actionBtn}>
                    <span style={{ fontSize: '1.2rem' }}>👥</span> Whole Class
                  </button>
                </div>
              </header>

              <div className="student-cards-container" style={{ display: 'grid', gap: displaySize === 'small' ? '12px' : '28px', gridTemplateColumns: `repeat(auto-fill, minmax(${displaySize === 'small' ? '150px' : displaySize === 'medium' ? '180px' : '220px'}, 1fr))`, padding: '10px', overflowY: 'auto', flex: 1, maxWidth: '100%', justifyContent: 'start' }}>
                {activeClass.students.map((s) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isAbsentToday = absentStudents.has(s.id) || (s.attendance === 'absent' && s.attendanceDate === today);
                  return (
                    <div
                      key={s.id}
                      onClick={(event) => {
                        if (isAttendanceMode) {
                          const next = new Set(absentStudents);
                          if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                          setAbsentStudents(next);
                        } else if (event?.ctrlKey || event?.metaKey) {
                          const next = new Set(selectedStudents);
                          if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                          setSelectedStudents(next);
                        } else if (!isAbsentToday) {
                          setSelectedStudent(s);
                        }
                      }}
                      style={{
                        position: 'relative',
                        opacity: isAttendanceMode ? (isAbsentToday ? 0.4 : 1) : (isAbsentToday ? 0.4 : (selectedStudents.size > 0 && !selectedStudents.has(s.id) ? 0.5 : 1)),
                        transition: 'opacity 0.15s, filter 0.15s',
                        cursor: isAttendanceMode ? 'pointer' : isAbsentToday ? 'not-allowed' : 'default',
                        filter: isAbsentToday ? 'grayscale(1)' : 'grayscale(0)',
                        pointerEvents: 'auto'
                      }}
                    >
                      <StudentCard student={s} onClick={() => { if (isAttendanceMode) { const next = new Set(absentStudents); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); setAbsentStudents(next); } else if (!isAbsentToday) { setSelectedStudent(s); } }} onEdit={handleEditStudent} onDelete={() => setDeleteConfirmStudentId(s.id)} />
                      {selectedStudents.has(s.id) && <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '3px solid #4CAF50', pointerEvents: 'none' }} />}
                      {isAbsentToday && !isAttendanceMode && <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '3px solid #FF9800', background: 'rgba(255, 152, 0, 0.1)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>ABSENT TODAY</div>}
                    </div>
                  );
                })}
                <div style={{ position: 'relative', minWidth: 0, aspectRatio: '1 / 1', display: 'flex' }}>
                  <div onClick={() => setIsAddStudentOpen(true)} className="add-student-button" style={{ background: 'white', border: '2px dashed #ddd', borderRadius: 16, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <UserPlus size={28} />
                      <div style={{ marginTop: 8, fontWeight: '700' }}>Add Student</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* MODALS */}
        {selectedStudent && <BehaviorModal student={selectedStudent} behaviors={behaviors} onClose={() => setSelectedStudent(null)} onGivePoint={handleGivePoint} />}
        {showClassBehaviorModal && <BehaviorModal student={{ name: 'Whole Class' }} behaviors={behaviors} onClose={() => setShowClassBehaviorModal(false)} onGivePoint={handleGivePointsToClass} />}
        {isLuckyDrawOpen && <LuckyDrawModal students={activeClass.students} onClose={() => setIsLuckyDrawOpen(false)} onWinner={(s) => { setIsLuckyDrawOpen(false); setSelectedStudent(s); }} />}

        {/* GRADING MODAL */}
        {gradingModalOpen && currentSubmission && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3>Grade {currentSubmission.student.name}'s Submission</h3>
              <p style={{ marginBottom: '10px', color: '#666' }}>Assignment: {currentSubmission.assignment.title}</p>
              <div style={{ background: '#F9FAFB', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <strong>Student Answer:</strong>
                <p>{currentSubmission.submission.answers[1] || "No answer provided"}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Points Awarded:</label>
                <input
                  type="number"
                  value={gradeInput}
                  onChange={e => setGradeInput(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={submitGrade} style={styles.saveBtn}>Submit Grade</button>
                <button onClick={() => setGradingModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isAddStudentOpen && (
          <AddStudentModal
            onClose={() => setIsAddStudentOpen(false)}
            onSave={(newStudent) => {
              const studentId = Date.now();
              const newCodes = { parentCode: generate5DigitCode(), studentCode: generate5DigitCode() };
              updateClasses((prev) => prev.map((c) => c.id === activeClass.id ? { ...c, students: [...c.students, { ...newStudent, id: studentId, score: 0 }], Access_Codes: { ...(c.Access_Codes || {}), [studentId]: newCodes } } : c));
              setIsAddStudentOpen(false);
            }}
          />
        )}

        {/* EDIT STUDENT MODAL & OTHER HELPERS REMAIN UNCHANGED BUT INCLUDED */}
        {editingStudentId && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={{ marginBottom: 16 }}>Edit Student</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <SafeAvatar src={editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : boringAvatar(editStudentName || 'anon', 'boy'))} name={editStudentName} alt={editStudentName} style={{ width: 100, height: 100, borderRadius: 50, objectFit: 'cover', background: '#F8FAFC' }} />
                <div style={{ marginTop: 10 }}><Camera size={14} /></div>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => { setEditStudentAvatar(reader.result); setEditSelectedSeed(null); }; reader.readAsDataURL(file); } }} style={{ marginTop: 12 }} />
                <div style={{ marginTop: 12, position: 'relative' }}>
                  <button onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#475569', transition: 'all 0.2s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{editSelectedSeed ? (<><img src={avatarByCharacter(editSelectedSeed)} alt={editSelectedSeed} style={{ width: 24, height: 24, borderRadius: 4 }} /><span style={{ textTransform: 'capitalize' }}>{editSelectedSeed}</span></>) : ('Choose character...')}</span>
                    <ChevronDown size={18} style={{ transform: showEditAvatarPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {showEditAvatarPicker && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '-110%', right: '-110%', marginBottom: '8px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1001, padding: '16px', minWidth: '550px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' }}>
                        {AVATAR_OPTIONS.map((char) => (
                          <button key={char.name} onClick={() => { setEditSelectedSeed(char.name); setEditStudentAvatar(null); setShowEditAvatarPicker(false); }} onMouseEnter={() => setHoveredEditChar(char.name)} onMouseLeave={() => setHoveredEditChar(null)} style={{ background: 'white', border: editSelectedSeed === char.name ? '2px solid #4CAF50' : '2px solid #e9ecef', borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 9, color: '#666', fontWeight: 500, outline: 'none', width: '70px', justifySelf: 'center', ...(hoveredEditChar === char.name ? { transform: 'scale(1.15)', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {}), ...(editSelectedSeed === char.name ? { boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' } : {}) }} title={char.label}>
                            <img src={avatarByCharacter(char.name)} alt={char.label} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', ...(hoveredEditChar === char.name ? { transform: 'scale(5)', position: 'absolute', bottom: 'calc(100% - 80px)', left: '50%', marginLeft: '-20px', zIndex: 20 } : {}) }} />
                            <span style={{ fontSize: 8, color: '#999', textTransform: 'capitalize' }}>{char.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <input autoFocus placeholder="Student name" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }} onKeyDown={(e) => e.key === 'Enter' && handleSaveStudentEdit()} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditingStudentId(null); setEditStudentName(''); setEditStudentAvatar(null); setEditSelectedSeed(null); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveStudentEdit} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#4CAF50', color: 'white' }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmStudentId && (
          <div style={styles.overlay}>
            <div style={{ ...styles.modal, width: 360 }}>
              <h3 style={{ marginBottom: 12 }}>Delete Student?</h3>
              <p style={{ color: '#666' }}>Are you sure you want to delete <strong>'{activeClass.students.find((s) => s.id === deleteConfirmStudentId)?.name}'</strong>?</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setDeleteConfirmStudentId(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white' }}>Cancel</button>
                <button onClick={() => handleDeleteStudent(activeClass.students.find((s) => s.id === deleteConfirmStudentId))} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#FF6B6B', color: 'white' }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        <PointAnimation isVisible={showPoint.visible} studentAvatar={showPoint.student?.avatar} studentName={showPoint.student?.name} students={showPoint.student?.students} points={showPoint.points} behaviorEmoji={showPoint.behaviorEmoji} onComplete={() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' })} />
      </div>
    </>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#F4F1EA', position: 'relative', overflow: 'hidden' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '30px 0', borderRight: '1px solid #ddd' },
  icon: { cursor: 'pointer', transition: 'color 0.2s', position: 'relative' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', height: '100vh', overflowY: 'auto' },
  header: { padding: '20px 40px', background: 'linear-gradient(90deg,#fff,#F8FFF8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 6px 18px rgba(16,24,40,0.06)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  addBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  gridMenu: { position: 'absolute', top: '50px', right: 0, background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '220px' },
  gridOption: { display: 'block', width: '100%', textAlign: 'left', padding: '10px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', border: '1px solid #ddd' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: 'white', padding: '24px', borderRadius: '16px', width: '500px' },

  // New Styles for Assignments/Messages
  card: { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2D3436' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box' },
  primaryBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  secondaryBtn: { background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { background: 'transparent', color: '#666', border: 'none', padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold' },
  messageCard: { background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '15px', border: '1px solid #E2E8F0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  messageHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  gradeBtn: { width: '100%', padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', background: '#FF5252', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  columnTitle: { borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#aaa', background: '#f9f9f9', borderRadius: '12px' },
  saveBtn: { flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#4CAF50', color: 'white' }
};