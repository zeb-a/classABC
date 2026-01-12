import React, { useState } from 'react';
import api from '../services/api';
import ReportsPage from './ReportsPage'; // Reusing your existing report logic
import { ChevronLeft, Lock } from 'lucide-react';

export default function ParentPortal({ onBack }) {
  const [accessCode, setAccessCode] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // We call a new API method to find a student by parent code
      const data = await api.getStudentByParentCode(accessCode);
      if (data) {
        setStudentData(data);
      } else {
        setError('Invalid Parent Access Code. Please check with your teacher.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  if (studentData) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh' }}>
        <button onClick={() => setStudentData(null)} style={styles.backBtn}>
          <ChevronLeft size={18} /> Logout from {studentData.studentName}
        </button>
        <ReportsPage activeClass={studentData.classData} studentId={studentData.studentId} isParentView={true} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.iconCircle}><Lock color="#FF5252" /></div>
        <h2 style={{ fontWeight: 900 }}>Parent Login</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Enter the 5-digit code from your teacher.</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <input 
            type="text" 
            placeholder="00000" 
            maxLength={5}
            style={styles.codeInput}
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
          {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
          <button type="submit" style={styles.submitBtn}>View Student Report</button>
          <button type="button" onClick={onBack} style={styles.cancelBtn}>Back to Home</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' },
  loginCard: { background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', width: '380px' },
  iconCircle: { width: '60px', height: '60px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  codeInput: { fontSize: '32px', textAlign: 'center', letterSpacing: '8px', width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #EEE', marginBottom: '10px', fontFamily: 'monospace' },
  submitBtn: { width: '100%', background: '#FF5252', color: '#fff', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  cancelBtn: { width: '100%', background: 'none', border: 'none', color: '#888', marginTop: '15px', cursor: 'pointer' },
  backBtn: { position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '5px', background: '#eee', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', zIndex: 100 }
};