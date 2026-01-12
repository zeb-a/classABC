import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* ================= 🧠 AI LOGIC (PRESERVED) ================= */

function classifyPerformance(behavior) {
    const pos = behavior.positive.total;
    const neg = behavior.negative.total;
    if (pos >= 30 && neg <= 5) return 'STRONG';
    if (pos >= 15 && neg <= pos * 0.6) return 'MIXED';
    return 'CONCERN';
}

function topItems(obj, count) {
    return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([k, v]) => `${k} (${v} points)`)
        .join(', ');
}

function generateRobustNote(student, behavior, period, language = 'en') {
    const level = classifyPerformance(behavior);
    const posList = topItems(behavior.positive.byCard, 2);
    const negList = topItems(behavior.negative.byCard, 1);
    const timeFrame = period === 'week' ? 'this past week' : (period === 'month' ? 'the last month' : 'this year');

    const templates = {
        en: {
            STRONG: `${student.name} has shown outstanding leadership ${timeFrame}. Their commitment to ${posList || 'class goals'} is inspiring.`,
            MIXED: `${student.name} is making steady progress ${timeFrame}. While they excel in ${posList || 'certain areas'}, they should stay mindful of consistency.`,
            CONCERN: `We are monitoring ${student.name}'s engagement ${timeFrame}. Focusing on positive interactions like ${posList || 'helping others'} will help them improve.`
        }
    };

    return templates[language][level] || templates['en'][level];
}

/* ================= 📊 MAIN COMPONENT ================= */

export default function ReportsPage({ activeClass, studentId, isParentView }) {
    const [timePeriod, setTimePeriod] = useState('week'); // 'week', 'month', 'year'

    // 1. SECURITY FILTER: Only show the child if studentId is provided (Portal View)
    const displayStudents = useMemo(() => {
        if (!activeClass || !activeClass.students) return [];
        if (studentId) {
            // Filter to only the student matching the parent access code
            return activeClass.students.filter(s => s.id.toString() === studentId.toString());
        }
        return activeClass.students;
    }, [activeClass, studentId]);

    // 2. MOCK DATA AGGREGATION (Link this to your history collection later)
    const getStudentStats = (student) => {
        return {
            positive: { total: Math.max(0, student.score), byCard: { "Participation": 5, "Kindness": 3 } },
            negative: { total: Math.min(0, student.score), byCard: { "Off-task": 1 } }
        };
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.mainTitle}>
                    {isParentView ? 'Student Progress Report' : `${activeClass?.name} Reports`}
                </h1>
                
                {/* Time Period Toggles */}
                <div style={styles.filterBar}>
                    {['week', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setTimePeriod(p)}
                            style={{
                                ...styles.periodBtn,
                                ...(timePeriod === p ? styles.periodBtnActive : {})
                            }}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {displayStudents.length === 0 ? (
                <div style={styles.emptyState}>No records found for this selection.</div>
            ) : (
                displayStudents.map(student => {
                    const stats = getStudentStats(student);
                    const aiNote = generateRobustNote(student, stats, timePeriod);

                    // Chart Data
                    const doughnutData = {
                        labels: ['Positive', 'Needs Work'],
                        datasets: [{
                            data: [stats.positive.total || 1, Math.abs(stats.negative.total)],
                            backgroundColor: ['#4CAF50', '#FF5252'],
                            borderWidth: 0,
                        }]
                    };

                    return (
                        <div key={student.id} style={styles.reportCard}>
                            <div style={styles.cardTop}>
                                <div style={styles.studentMeta}>
                                    <div style={styles.avatarCircle}>{student.name.charAt(0)}</div>
                                    <div>
                                        <h2 style={styles.sName}>{student.name}</h2>
                                        <div style={styles.idTag}>ID: {student.id}</div>
                                    </div>
                                </div>
                                <div style={styles.scoreBox}>
                                    <div style={styles.bigScore}>{student.score || 0}</div>
                                    <div style={styles.scoreLabel}>Total Points</div>
                                </div>
                            </div>

                            {/* AI SUMMARY BOX */}
                            <div style={styles.aiInsightSection}>
                                <div style={styles.aiPulse} />
                                <p style={styles.aiText}><strong>AI Summary:</strong> {aiNote}</p>
                            </div>

                            {/* BENTO GRID FOR CHARTS */}
                            <div style={styles.bentoGrid}>
                                <div style={styles.gridItemLarge}>
                                    <h4 style={styles.chartTitle}>Behavior Distribution</h4>
                                    <div style={{ height: '200px' }}>
                                        <Bar 
                                            data={{
                                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                                datasets: [{
                                                    label: 'Points Earned',
                                                    data: [4, 7, 3, 9, 5],
                                                    backgroundColor: '#4CAF50',
                                                    borderRadius: 8
                                                }]
                                            }}
                                            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                        />
                                    </div>
                                </div>

                                <div style={styles.gridItemSmall}>
                                    <h4 style={styles.chartTitle}>Ratio</h4>
                                    <div style={{ height: '140px' }}>
                                        <Doughnut 
                                            data={doughnutData}
                                            options={{ maintainAspectRatio: false, cutout: '70%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

const styles = {
    container: { padding: '40px', background: '#fff', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' },
    mainTitle: { fontSize: '24px', fontWeight: '900', color: '#1a1a1a' },
    filterBar: { display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '12px' },
    periodBtn: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', fontWeight: '700', color: '#888' },
    periodBtnActive: { background: '#fff', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    reportCard: { background: '#fff', borderRadius: '24px', border: '1px solid #eee', padding: '30px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' },
    studentMeta: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatarCircle: { width: '50px', height: '50px', background: '#4CAF50', color: '#fff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' },
    sName: { margin: 0, fontSize: '20px', fontWeight: '800' },
    idTag: { fontSize: '12px', color: '#aaa' },
    scoreBox: { textAlign: 'center', background: '#F8FFF8', padding: '10px 20px', borderRadius: '16px', border: '1px solid #E8F5E9' },
    bigScore: { fontSize: '28px', fontWeight: '900', color: '#4CAF50' },
    scoreLabel: { fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#888' },
    aiInsightSection: { background: '#F8F9FA', padding: '20px', borderRadius: '18px', border: '1px solid #EDF2F7', marginBottom: '25px', position: 'relative' },
    aiText: { fontSize: '15px', lineHeight: '1.6', color: '#4A5568', margin: 0 },
    aiPulse: { position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 10px #6366f1' },
    bentoGrid: { display: 'flex', gap: '20px' },
    gridItemLarge: { flex: 2, background: '#fcfcfc', padding: '20px', borderRadius: '24px', border: '1px solid #f0f0f0' },
    gridItemSmall: { flex: 1, background: '#fcfcfc', padding: '20px', borderRadius: '24px', border: '1px solid #f0f0f0', textAlign: 'center' },
    chartTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#444' },
    emptyState: { textAlign: 'center', padding: '50px', color: '#ccc' }
};