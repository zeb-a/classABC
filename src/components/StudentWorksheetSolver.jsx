import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const StudentWorksheetSolver = ({ worksheet, onClose, studentName, studentId, classId, classes, setClasses }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === 'blank') {
      // For fill-in-blanks, we need to process the question text to extract blank positions
      const blanks = worksheet.questions.find(q => q.id === questionId)?.question.match(/\[blank\]/gi);
      if (blanks) {
        // Store array of answers for multiple blanks
        const currentAnswers = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
        currentAnswers[value.index] = value.answer;
        setAnswers(prev => ({
          ...prev,
          [questionId]: currentAnswers
        }));
      }
    } else if (questionType === 'match') {
      // For matching questions, store object with pairs
      const currentMatches = answers[questionId] || {};
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...currentMatches,
          [value.key]: value.value
        }
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

  const handleSubmit = () => {
    const submission = {
      id: Date.now(),
      assignmentId: worksheet.id,
      assignmentTitle: worksheet.title,
      studentName: studentName,
      studentId: String(studentId), // Ensure studentId is string for consistency
      answers: answers,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };

    // Update the global classes state in App.jsx
    const updatedClasses = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          submissions: [...(c.submissions || []), submission]
        };
      }
      return c;
    });

    setClasses(updatedClasses); // This pushes the work to the Teacher's Inbox
    alert("Worksheet submitted successfully!");
    onClose();
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'choice':
        return (
          <div style={{ display: 'grid', gap: '10px' }}>
            {question.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleAnswerChange(question.id, opt, question.type)}
                style={{
                  padding: '15px', borderRadius: '12px', textAlign: 'left', border: '2px solid',
                  borderColor: answers[question.id] === opt ? '#6366F1' : '#E2E8F0',
                  background: answers[question.id] === opt ? '#EEF2FF' : '#fff',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      
      case 'blank':
        // Process the question text to find blanks
        const parts = question.question.split('[blank]');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {parts.map((part, index) => (
                <React.Fragment key={index}>
                  <span style={{ marginRight: '5px' }}>{part}</span>
                  {index < parts.length - 1 && (
                    <input
                      style={{
                        width: '80px',
                        padding: '8px',
                        margin: '0 5px',
                        borderRadius: '8px',
                        border: '2px solid #E2E8F0',
                        fontSize: '16px'
                      }}
                      placeholder="Answer"
                      onChange={(e) => handleAnswerChange(question.id, { index, answer: e.target.value }, question.type)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'match':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {question.pairs.map((pair, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, padding: '10px', background: '#F1F5F9', borderRadius: '8px' }}>
                  {pair.left}
                </div>
                <div style={{ width: '30px', textAlign: 'center' }}>→</div>
                <input
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #E2E8F0',
                    fontSize: '16px'
                  }}
                  placeholder={`Match for "${pair.left}"`}
                  onChange={(e) => handleAnswerChange(question.id, { key: pair.left, value: e.target.value }, question.type)}
                />
              </div>
            ))}
          </div>
        );

      case 'comprehension':
        return (
          <textarea
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              fontSize: '16px',
              minHeight: '120px',
              resize: 'vertical'
            }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );

      default: // text and other types
        return (
          <input
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              fontSize: '16px'
            }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );
    }
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <ChevronLeft size={20} /> Quit
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>{worksheet.title}</h2>
        <button onClick={handleSubmit} style={{ background: '#4F46E5', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
          Finish & Submit
        </button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {worksheet.questions.map((q, idx) => (
            <div key={q.id} style={{ background: '#fff', borderRadius: '24px', padding: '30px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#6366F1', textTransform: 'uppercase' }}>Question {idx + 1}</span>

              {q.paragraph && (
                <div style={{ background: '#F1F5F9', padding: '20px', borderRadius: '16px', margin: '15px 0', lineHeight: '1.6', fontSize: '16px' }}>
                  {q.paragraph}
                </div>
              )}

              <h3 style={{ fontSize: '20px', margin: '15px 0' }}>{q.question}</h3>

              {q.image && <img src={q.image} style={{ width: '100%', borderRadius: '16px', marginBottom: '20px' }} alt="question" />}

              {/* Answer Inputs */}
              {renderQuestionInput(q)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentWorksheetSolver;