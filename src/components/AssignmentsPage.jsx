import React, { useState, useRef } from 'react';
import { 
  Plus, Send, Trash2, ChevronLeft, Image as ImageIcon,
  Type, List, AlignLeft, Grid, FileText, X, GripVertical,
  Users, User
} from 'lucide-react';

export default function AssignmentsPage({ activeClass, onBack, onPublish }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, type: 'text', question: '', image: null, options: [''], paragraph: '', pairs: [{left: '', right: ''}] }
  ]);
  const [assignToAll, setAssignToAll] = useState(true); // New state for assigning to all students
  const [selectedStudents, setSelectedStudents] = useState([]); // New state for selected students
  
  const fileInputRef = useRef(null);
  const [activePhotoId, setActivePhotoId] = useState(null);

  const addQuestion = (type) => {
    setQuestions([...questions, { 
      id: Date.now(), 
      type, 
      question: '', 
      image: null, 
      options: type === 'choice' ? ['', '', ''] : [],
      paragraph: type === 'comprehension' ? '' : '',
      pairs: type === 'match' ? [{left: '', right: ''}, {left: '', right: ''}] : []
    }]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && activePhotoId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestions(questions.map(q => q.id === activePhotoId ? { ...q, image: reader.result } : q));
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={styles.backBtn}><ChevronLeft /></button>
          <input 
            style={styles.titleInput} 
            placeholder="Untitled Worksheet..." 
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Assignment Distribution Options */}
          <div style={styles.distributionSelector}>
            <div 
              style={{ 
                ...styles.toggleButton, 
                background: assignToAll ? '#4F46E5' : '#E2E8F0',
                color: assignToAll ? '#fff' : '#64748B'
              }}
              onClick={() => setAssignToAll(true)}
            >
              <Users size={16} /> All Students
            </div>
            <div 
              style={{ 
                ...styles.toggleButton, 
                background: !assignToAll ? '#4F46E5' : '#E2E8F0',
                color: !assignToAll ? '#fff' : '#64748B'
              }}
              onClick={() => setAssignToAll(false)}
            >
              <User size={16} /> Select Students
            </div>
          </div>
          
          <button 
            onClick={() => onPublish({ 
              title: title || "New Worksheet", 
              questions, 
              date: new Date().toISOString(),
              assignedTo: assignToAll ? 'all' : selectedStudents,
              assignedToAll: assignToAll
            })} 
            style={styles.publishBtn}
          >
            <Send size={18} /> Publish to Class
          </button>
        </div>
      </header>

      {!assignToAll && (
        <div style={styles.studentSelector}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700' }}>Select Students:</h3>
          <div style={styles.studentList}>
            {activeClass?.students?.map(student => (
              <div 
                key={student.id}
                style={{
                  ...styles.studentItem,
                  background: selectedStudents.includes(student.id) ? '#EEF2FF' : '#fff',
                  border: `2px solid ${selectedStudents.includes(student.id) ? '#4F46E5' : '#E2E8F0'}`
                }}
                onClick={() => toggleStudentSelection(student.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid #4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedStudents.includes(student.id) && (
                      <div style={{ width: '8px', height: '8px', background: '#4F46E5', borderRadius: '50%' }}></div>
                    )}
                  </div>
                  <span>{student.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarLabel}>QUESTION TYPES</p>
            <button onClick={() => addQuestion('text')} style={styles.typeBtn}><Type size={18}/> Short Answer</button>
            <button onClick={() => addQuestion('choice')} style={styles.typeBtn}><List size={18}/> Multiple Choice</button>
            <button onClick={() => addQuestion('blank')} style={styles.typeBtn}><AlignLeft size={18}/> Fill in Blanks</button>
            <button onClick={() => addQuestion('match')} style={styles.typeBtn}><Grid size={18}/> Matching</button>
            <button onClick={() => addQuestion('comprehension')} style={styles.typeBtn}><FileText size={18}/> Comprehension</button>
          </div>
        </aside>

        <main style={styles.canvas}>
          {questions.map((q, idx) => (
            <div key={q.id} style={styles.qCard}>
              <div style={styles.qCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GripVertical size={16} color="#CBD5E1" />
                  <span style={styles.qNumber}>Question {idx + 1}</span>
                  <span style={styles.qBadge}>{q.type.toUpperCase()}</span>
                </div>
                <button onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} style={styles.deleteBtn}>
                  <Trash2 size={16} />
                </button>
              </div>

              {/* COMPREHENSION SPECIFIC */}
              {q.type === 'comprehension' && (
                <div style={styles.specialSection}>
                  <p style={styles.inputLabel}>Reading Passage</p>
                  <textarea 
                    style={styles.paragraphInput}
                    placeholder="Type or paste the story/passage here..."
                    value={q.paragraph}
                    onChange={e => {
                      const newQs = [...questions];
                      newQs[idx].paragraph = e.target.value;
                      setQuestions(newQs);
                    }}
                  />
                </div>
              )}

              <div style={styles.questionRow}>
                <div style={{flex: 1}}>
                  <p style={styles.inputLabel}>Instruction / Question</p>
                  <input 
                    style={styles.qInput} 
                    placeholder={q.type === 'blank' ? "Use [blank] for missing words..." : "What is the question?"}
                    value={q.question}
                    onChange={e => {
                      const newQs = [...questions];
                      newQs[idx].question = e.target.value;
                      setQuestions(newQs);
                    }}
                  />
                </div>
                <button onClick={() => { setActivePhotoId(q.id); fileInputRef.current.click(); }} style={styles.imageIconBtn}>
                  {q.image ? <img src={q.image} style={styles.thumb} alt=""/> : <ImageIcon size={22} />}
                </button>
              </div>

              {/* MULTIPLE CHOICE OPTIONS */}
              {q.type === 'choice' && (
                <div style={styles.optionsGrid}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={styles.optionRow}>
                      <div style={styles.radioPlaceholder} />
                      <input 
                        style={styles.optionInput} 
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={e => {
                          const newQs = [...questions];
                          newQs[idx].options[oIdx] = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                    </div>
                  ))}
                  <button onClick={() => {
                    const newQs = [...questions];
                    newQs[idx].options.push('');
                    setQuestions(newQs);
                  }} style={styles.addSmallBtn}>+ Add Option</button>
                </div>
              )}

              {/* MATCHING PAIRS */}
              {q.type === 'match' && (
                <div style={styles.pairsContainer}>
                  {q.pairs.map((pair, pIdx) => (
                    <div key={pIdx} style={styles.pairRow}>
                      <input 
                        placeholder="Item A" 
                        style={styles.pairInput}
                        value={pair.left}
                        onChange={e => {
                          const newQs = [...questions];
                          newQs[idx].pairs[pIdx].left = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                      <div style={styles.matchLine} />
                      <input 
                        placeholder="Match B" 
                        style={styles.pairInput}
                        value={pair.right}
                        onChange={e => {
                          const newQs = [...questions];
                          newQs[idx].pairs[pIdx].right = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                    </div>
                  ))}
                  <button onClick={() => {
                    const newQs = [...questions];
                    newQs[idx].pairs.push({left: '', right: ''});
                    setQuestions(newQs);
                  }} style={styles.addSmallBtn}>+ Add Pair</button>
                </div>
              )}
            </div>
          ))}
          <div style={{height: '100px'}} />
        </main>
      </div>
      <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F1F5F9', fontFamily: 'Inter, sans-serif' },
  header: { padding: '16px 32px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  titleInput: { fontSize: '20px', fontWeight: '800', border: 'none', outline: 'none', width: '300px', color: '#1E293B' },
  backBtn: { background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
  publishBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#4F46E5', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '260px', background: '#fff', borderRight: '1px solid #E2E8F0', padding: '24px' },
  sidebarLabel: { fontSize: '11px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '16px' },
  typeBtn: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid transparent', background: '#fff', marginBottom: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', textAlign: 'left', transition: 'all 0.2s' },
  canvas: { flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qCard: { background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '800px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' },
  qCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  qNumber: { fontWeight: '800', color: '#64748B', fontSize: '14px' },
  qBadge: { background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', marginLeft: '10px' },
  deleteBtn: { background: '#FFF1F2', color: '#E11D48', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  inputLabel: { fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px' },
  qInput: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' },
  imageIconBtn: { width: '50px', height: '50px', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F8FAFC', color: '#64748B', overflow: 'hidden', marginTop: '22px' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  paragraphInput: { width: '100%', height: '120px', padding: '16px', borderRadius: '12px', border: '2px solid #F1F5F9', marginBottom: '16px', fontFamily: 'inherit', resize: 'vertical' },
  optionsGrid: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  optionRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  radioPlaceholder: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #CBD5E1' },
  optionInput: { flex: 1, padding: '10px', border: 'none', borderBottom: '2px solid #F1F5F9', outline: 'none' },
  addSmallBtn: { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#4F46E5', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginTop: '10px' },
  pairRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' },
  pairInput: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' },
  matchLine: { width: '30px', height: '2px', background: '#CBD5E1' },
  questionRow: { display: 'flex', gap: '20px' },
  distributionSelector: { display: 'flex', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  toggleButton: { padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: '#E2E8F0', fontWeight: '600' },
  studentSelector: { padding: '20px 40px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
  studentList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
  studentItem: { padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', border: '2px solid #E2E8F0', transition: 'all 0.2s' }
};