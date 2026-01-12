import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* ================= 🌐 LANGUAGE SELECTION ================= */
const translations = {
    en: {
        mainTitle: (isParentView, className) => isParentView ? 'Student Progress Report' : `${className} Reports`,
        week: 'Week',
        month: 'Month',
        year: 'Year',
        emptyState: 'No records found for this selection.',
        aiSummary: 'Teacher Feedback:',
        positive: 'Positive',
        needsWork: 'Needs Work',
        behaviorDistribution: 'Behavior Distribution',
        ratio: 'Ratio',
        totalPoints: 'Total Points'
    },
    zh: {
        mainTitle: (isParentView, className) => isParentView ? '学生成长报告' : `${className} 报告`,
        week: '周',
        month: '月',
        year: '年',
        emptyState: '未找到此选择的记录。',
        aiSummary: '教师反馈：',
        positive: '积极表现',
        needsWork: '需要改进',
        behaviorDistribution: '行为分布',
        ratio: '比例',
        totalPoints: '总分'
    }
};

/* ================= 🧠 ADVANCED TEACHER-LIKE TEXT GENERATION ================= */

// Check if student has participated (has points)
function hasParticipated(behavior) {
    return behavior.positive.total > 0 || behavior.negative.total < 0;
}

// Analyze behavior patterns in depth
function analyzeBehaviorPattern(behavior) {
    const analysis = {
        positiveDominant: behavior.positive.total > Math.abs(behavior.negative.total),
        balanced: Math.abs(behavior.positive.total - Math.abs(behavior.negative.total)) <= 5,
        concerning: behavior.negative.total < 0 && Math.abs(behavior.negative.total) > behavior.positive.total,
        highlyActive: behavior.positive.total + Math.abs(behavior.negative.total) > 20,
        consistent: behavior.positive.total > 10 && behavior.negative.total === 0,
        improving: behavior.positive.total > 0 && behavior.negative.total === 0 && behavior.positive.total < 10
    };
    
    return analysis;
}

// Generate descriptive feedback based on behavior categories
function describeBehaviors(behavior, count = 2, language = 'en') {
    const allBehaviors = [];
    
    // Add positive behaviors
    Object.entries(behavior.positive.byCard || {}).forEach(([card, points]) => {
        if (points > 0) {
            allBehaviors.push({type: 'positive', card, points});
        }
    });
    
    // Add negative behaviors
    Object.entries(behavior.negative.byCard || {}).forEach(([card, points]) => {
        if (points > 0) {
            allBehaviors.push({type: 'negative', card, points});
        }
    });
    
    // Sort by points (descending)
    allBehaviors.sort((a, b) => b.points - a.points);
    
    // Return top behaviors with context
    return allBehaviors.slice(0, count).map(item => {
        if (item.type === 'positive') {
            if (language === 'zh') {
                // Better Chinese translations for positive behaviors
                const chinesePositives = {
                    "Great work": "表现出色",
                    "Homework": "作业完成得好",
                    "Helping others": "乐于助人",
                    "Participation": "积极参与",
                    "Kindness": "善良友善"
                };
                
                const behaviorZh = chinesePositives[item.card] || item.card;
                if (item.points >= 10) return `${behaviorZh}（表现优异，获得${item.points}分）`;
                else if (item.points >= 5) return `${behaviorZh}（表现突出，获得${item.points}分）`;
                else return `${behaviorZh}（积极贡献，获得${item.points}分）`;
            } else {
                if (item.points >= 10) return `${item.card} (excellent performance with ${item.points} points)`;
                else if (item.points >= 5) return `${item.card} (strong showing with ${item.points} points)`;
                else return `${item.card} (positive contribution with ${item.points} points)`;
            }
        } else {
            if (language === 'zh') {
                // Better Chinese translations for negative behaviors
                const chineseNegatives = {
                    "Off-task": "注意力不集中",
                    "Disrespectful": "不尊重他人",
                    "Late": "迟到",
                    "Incomplete work": "作业未完成",
                    "Disruptive": "扰乱秩序"
                };
                
                const behaviorZh = chineseNegatives[item.card] || item.card;
                if (item.points >= 10) return `${behaviorZh}（需要关注，扣${item.points}分）`;
                else if (item.points >= 5) return `${behaviorZh}（存在问题，扣${item.points}分）`;
                else return `${behaviorZh}（小问题，扣${item.points}分）`;
            } else {
                if (item.points >= 10) return `${item.card} (needs attention, ${item.points} points deducted)`;
                else if (item.points >= 5) return `${item.card} (some issues, ${item.points} points deducted)`;
                else return `${item.card} (minor issues, ${item.points} points deducted)`;
            }
        }
    }).join(', ');
}

function generateTeacherNote(student, behavior, period, language = 'en') {
    // Check if student has participated at all
    if (!hasParticipated(behavior)) {
        if (language === 'zh') {
            return `${student.name} 尚未参与任何活动或获得分数。请鼓励孩子积极参与课堂活动，以便更好地了解其发展情况。`;
        }
        return `${student.name} has not yet participated in any activities or earned any points. Please encourage your child to engage in class activities so we can better assess their progress.`;
    }

    const pattern = analyzeBehaviorPattern(behavior);
    const behaviorDescription = describeBehaviors(behavior, 3, language);
    const timeFrame = period === 'week' ? 'this past week' : (period === 'month' ? 'the last month' : 'this year');
    const timeFrameZh = period === 'week' ? '本周' : (period === 'month' ? '本月' : '本年度');

    // More intelligent, context-aware feedback generation based on actual data
    let feedback;

    if (pattern.consistent) {
        // Student with high positive scores and no negatives
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}表现非常出色！在${behaviorDescription}等方面展现了卓越的能力。继续保持这种积极的学习态度！`;
        } else {
            feedback = `${student.name} has shown exceptional performance ${timeFrame}! They excelled in ${behaviorDescription}. Keep up this excellent work!`;
        }
    } else if (pattern.improving) {
        // Student with positive scores but low total and no negatives
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}表现积极，特别是在${behaviorDescription}方面。继续保持这种良好的势头！`;
        } else {
            feedback = `${student.name} showed positive engagement ${timeFrame}, particularly in ${behaviorDescription}. Keep building on this momentum!`;
        }
    } else if (pattern.positiveDominant) {
        // More positives than negatives
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}整体表现良好，在${behaviorDescription}等方面做得不错。继续加强这些优势，同时注意改善不足之处。`;
        } else {
            feedback = `${student.name} showed good overall performance ${timeFrame} with strengths in ${behaviorDescription}. Continue building these strengths while working on areas needing improvement.`;
        }
    } else if (pattern.balanced) {
        // Similar amounts of positive and negative
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}表现较为均衡，在${behaviorDescription}等方面有亮点，但也有需要改进的地方。我们将继续引导学生平衡发展。`;
        } else {
            feedback = `${student.name} showed a mixed performance ${timeFrame} with highlights in ${behaviorDescription} but also areas needing improvement. We'll continue guiding balanced development.`;
        }
    } else if (pattern.concerning) {
        // More negatives than positives
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}需要更多关注和支持。在${behaviorDescription}等方面存在挑战，我们正与学生一起努力改善这些问题。`;
        } else {
            feedback = `${student.name} needs additional support ${timeFrame}. Challenges appeared in ${behaviorDescription}, and we're working with the student to address these issues.`;
        }
    } else if (pattern.highlyActive) {
        // Very high activity (both positive and negative)
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}参与度很高，活动频繁，涉及${behaviorDescription}等多个方面。我们将帮助学生更好地管理自己的行为，发挥优势。`;
        } else {
            feedback = `${student.name} was very active ${timeFrame} across multiple areas including ${behaviorDescription}. We'll help channel this energy positively.`;
        }
    } else {
        // General case
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}的表现反映了${behaviorDescription}等情况。我们将继续观察并支持学生的成长。`;
        } else {
            feedback = `${student.name}'s performance ${timeFrame} reflected ${behaviorDescription}. We'll continue monitoring and supporting their growth.`;
        }
    }

    return feedback;
}

/* ================= 📊 MAIN COMPONENT ================= */

export default function ReportsPage({ activeClass, studentId, isParentView, onBack }) {
    const [timePeriod, setTimePeriod] = useState('week'); // 'week', 'month', 'year'
    const [language, setLanguage] = useState('en'); // 'en' or 'zh'
    const [selectedStudentId, setSelectedStudentId] = useState(studentId || '');
    const [realStats, setRealStats] = useState({});

    // 1. SECURITY FILTER: Only show the child if studentId is provided (Portal View)
    const displayStudents = useMemo(() => {
        if (!activeClass || !activeClass.students) return [];
        if (studentId) {
            // Filter to only the student matching the parent access code
            return activeClass.students.filter(s => s.id.toString() === studentId.toString());
        }
        // For class view, use selected student if available
        if (selectedStudentId) {
            return activeClass.students.filter(s => s.id.toString() === selectedStudentId.toString());
        }
        return activeClass.students;
    }, [activeClass, studentId, selectedStudentId]);

    // Fetch real behavior data from student history
    useEffect(() => {
        const fetchRealStats = async () => {
            const stats = {};
            
            for (const student of displayStudents) {
                const studentHistory = student.history || [];
                
                // Filter history based on time period
                const filteredHistory = filterHistoryByTimePeriod(studentHistory, timePeriod);
                
                // Separate positive and negative behaviors
                const positiveBehaviors = filteredHistory.filter(h => h.pts > 0);
                const negativeBehaviors = filteredHistory.filter(h => h.pts < 0);
                
                // Calculate totals
                const positiveTotal = positiveBehaviors.reduce((sum, h) => sum + h.pts, 0);
                const negativeTotal = negativeBehaviors.reduce((sum, h) => sum + h.pts, 0);
                
                // Group by card/label
                const positiveByCard = {};
                const negativeByCard = {};
                
                positiveBehaviors.forEach(h => {
                    positiveByCard[h.label] = (positiveByCard[h.label] || 0) + h.pts;
                });
                
                negativeBehaviors.forEach(h => {
                    // Use absolute value for negative points in the count
                    negativeByCard[h.label] = (negativeByCard[h.label] || 0) + Math.abs(h.pts);
                });
                
                stats[student.id] = {
                    positive: { 
                        total: positiveTotal, 
                        byCard: positiveByCard,
                        wowCount: positiveBehaviors.length  // Count of positive behaviors
                    },
                    negative: { 
                        total: negativeTotal, 
                        byCard: negativeByCard,
                        nonoCount: negativeBehaviors.length  // Count of negative behaviors
                    }
                };
            }
            
            setRealStats(stats);
        };

        if (displayStudents.length > 0) {
            fetchRealStats();
        }
    }, [displayStudents, timePeriod]);

    // Helper function to filter history by time period
    const filterHistoryByTimePeriod = (history, period) => {
        const now = new Date();
        let cutoffDate;

        switch (period) {
            case 'week':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'year':
                cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoffDate;
        });
    };

    // REAL DATA AGGREGATION FROM STUDENT HISTORY
    const getStudentStats = (student) => {
        return realStats[student.id] || {
            positive: { 
                total: 0, 
                byCard: {},
                wowCount: 0
            },
            negative: { 
                total: 0, 
                byCard: {},
                nonoCount: 0
            }
        };
    };

    // 3. REAL DAILY BEHAVIOR DATA AGGREGATION FUNCTION
    const getDailyBehaviorData = (student) => {
        const studentHistory = student.history || [];
        const filteredHistory = filterHistoryByTimePeriod(studentHistory, timePeriod);

        // Group history by day depending on the time period
        const dailyTotals = {};
        
        filteredHistory.forEach(entry => {
            const entryDate = new Date(entry.timestamp);
            let dateKey;
            
            if (timePeriod === 'week') {
                // Format as day of week for weekly view
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dateKey = days[entryDate.getDay()];
            } else if (timePeriod === 'month') {
                // Format as day of month for monthly view
                dateKey = `Day ${entryDate.getDate()}`;
            } else { // year
                // Format as month for yearly view
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                dateKey = months[entryDate.getMonth()];
            }
            
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + entry.pts;
        });

        // Create labels based on time period
        let labels = [];
        if (timePeriod === 'week') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        } else if (timePeriod === 'month') {
            // Show first 10 days for readability
            labels = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`);
        } else { // year
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }

        // Fill in the data for each day
        const data = labels.map(label => dailyTotals[label] || 0);
        
        return {
            labels: labels,
            datasets: [{
                label: 'Total Points',
                data: data,
                backgroundColor: '#4CAF50',
                borderRadius: 8
            }]
        };
    };

    const t = translations[language]; // shorthand for translations

    const handlePrint = () => {
        window.print();
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div style={styles.container} className="reports-page-container">
            {/* Add responsive styles via style tag */}
            <style>
                {`
                    @media (max-width: 768px) {
                        .reports-page-container {
                            padding: 20px;
                        }
                        
                        .reports-page-header {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        
                        .reports-page-right-controls {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        
                        .reports-page-student-select {
                            width: 100%;
                        }
                        
                        .reports-page-bento-grid {
                            flex-direction: column;
                        }
                        
                        .reports-page-grid-item-large,
                        .reports-page-grid-item-small {
                            width: 100%;
                        }
                        
                        .reports-page-floating-print-button {
                            bottom: 120px;
                            left: 15px;
                            width: 45px;
                            height: 45px;
                            font-size: 20px;
                        }
                        
                        .reports-page-floating-top-button {
                            bottom: 20px;
                            left: 15px;
                            width: 45px;
                            height: 45px;
                            font-size: 18px;
                        }
                    }

                    @media (max-width: 480px) {
                        .reports-page-container {
                            padding: 15px;
                        }
                        
                        .reports-page-main-title {
                            font-size: 20px;
                        }
                        
                        .reports-page-report-card {
                            padding: 15px;
                        }
                        
                        .reports-page-avatar-circle {
                            width: 40px;
                            height: 40px;
                            font-size: 16px;
                        }
                        
                        .reports-page-s-name {
                            font-size: 18px;
                        }
                        
                        .reports-page-big-score {
                            font-size: 24px;
                        }
                        
                        .reports-page-floating-print-button {
                            bottom: 110px;
                            left: 10px;
                            width: 40px;
                            height: 40px;
                            font-size: 18px;
                        }
                        
                        .reports-page-floating-top-button {
                            bottom: 15px;
                            left: 10px;
                            width: 40px;
                            height: 40px;
                            font-size: 16px;
                        }
                    }
                `}
            </style>
            
            <div style={styles.header} className="reports-page-header">
                <div style={styles.headerLeft}>
                    {/* Go Back Button */}
                    <button 
                        onClick={onBack || (() => window.history.back())}
                        style={styles.goBackBtn}
                        aria-label="Go back"
                    >
                        ← Back
                    </button>
                    
                    <h1 style={styles.mainTitle} className="reports-page-main-title">
                        {selectedStudentId && !isParentView 
                            ? `${activeClass?.students?.find(s => s.id === selectedStudentId)?.name || ''} - ${t.mainTitle(isParentView, activeClass?.name)}` 
                            : t.mainTitle(isParentView, activeClass?.name)}
                    </h1>
                    
                    {/* Language Selector */}
                    <div style={styles.langSelector}>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                ...styles.langBtn,
                                ...(language === 'en' ? styles.langBtnActive : {})
                            }}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('zh')}
                            style={{
                                ...styles.langBtn,
                                ...(language === 'zh' ? styles.langBtnActive : {})
                            }}
                        >
                            中文
                        </button>
                    </div>
                </div>
                
                <div style={styles.rightControls} className="reports-page-right-controls">
                    {/* Student Selection Dropdown */}
                    {!studentId && activeClass && activeClass.students && activeClass.students.length > 1 && (
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            style={styles.studentSelect}
                            className="reports-page-student-select"
                        >
                            <option value="">All Students</option>
                            {activeClass.students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    )}
                    
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
                                {t[p]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Print Icon */}
            <button 
                onClick={handlePrint}
                style={styles.floatingPrintButton}
                className="reports-page-floating-print-button"
                title="Print Report"
                aria-label="Print Report"
            >
                🖨️
            </button>

            {/* Floating Go to Top Icon */}
            <button 
                onClick={scrollToTop}
                style={styles.floatingTopButton}
                className="reports-page-floating-top-button"
                title="Go to Top"
                aria-label="Go to Top"
            >
                ↑
            </button>

            {displayStudents.length === 0 ? (
                <div style={styles.emptyState} className="reports-page-empty-state">{t.emptyState}</div>
            ) : (
                displayStudents.map(student => {
                    const stats = getStudentStats(student);
                    const teacherNote = generateTeacherNote(student, stats, timePeriod, language);

                    // Chart Data - Using actual positive vs negative points for accurate ratio
                    const doughnutData = {
                        labels: [
                            language === 'zh' ? '积极行为' : 'Positive Behaviors', 
                            language === 'zh' ? '需改进行为' : 'Needs Work'
                        ],
                        datasets: [{
                            data: [Math.abs(stats.positive.total) || 0, Math.abs(stats.negative.total) || 0],
                            backgroundColor: ['#4CAF50', '#FF5252'],
                            borderWidth: 0,
                        }]
                    };

                    return (
                        <div key={student.id} style={styles.reportCard} className="reports-page-report-card">
                            <div style={styles.cardTop} className="reports-page-card-top">
                                <div style={styles.studentMeta} className="reports-page-student-meta">
                                    <div style={styles.avatarCircle} className="reports-page-avatar-circle">{student.name.charAt(0)}</div>
                                    <div>
                                        <h2 style={styles.sName} className="reports-page-s-name">{student.name}</h2>
                                        <div style={styles.idTag} className="reports-page-id-tag">ID: {student.id}</div>
                                    </div>
                                </div>
                                <div style={styles.scoreBox} className="reports-page-score-box">
                                    <div style={styles.bigScore} className="reports-page-big-score">{student.score || 0}</div>
                                    <div style={styles.scoreLabel} className="reports-page-score-label">{t.totalPoints}</div>
                                </div>
                            </div>

                            {/* TEACHER FEEDBACK BOX */}
                            <div style={styles.aiInsightSection} className="reports-page-ai-insight-section">
                                <div style={styles.aiPulse} className="reports-page-ai-pulse" />
                                <p style={styles.aiText} className="reports-page-ai-text"><strong>{t.aiSummary}</strong> {teacherNote}</p>
                            </div>

                            {/* BENTO GRID FOR CHARTS */}
                            <div style={styles.bentoGrid} className="reports-page-bento-grid">
                                <div style={styles.gridItemLarge} className="reports-page-grid-item-large">
                                    <h4 style={styles.chartTitle} className="reports-page-chart-title">{t.behaviorDistribution}</h4>
                                    <div style={{ height: '200px' }}>
                                        <Bar 
                                            data={getDailyBehaviorData(student)}
                                            options={{ 
                                                maintainAspectRatio: false, 
                                                plugins: { 
                                                    legend: { display: true },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function(context) {
                                                                return `${context.dataset.label}: ${context.parsed.y} points`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={styles.gridItemSmall} className="reports-page-grid-item-small">
                                    <h4 style={styles.chartTitle} className="reports-page-chart-title">{t.ratio}</h4>
                                    <div style={{ height: '140px' }}>
                                        <Doughnut 
                                            data={doughnutData}
                                            options={{ 
                                                maintainAspectRatio: false, 
                                                cutout: '70%',
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            boxWidth: 12,
                                                            padding: 10,
                                                            font: {
                                                                size: 10
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
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
    container: { 
        padding: '40px', 
        background: '#fff', 
        minHeight: '100vh',
        position: 'relative'
    },
    header: { 
        display: 'flex', 
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '30px', 
        borderBottom: '1px solid #f0f0f0', 
        paddingBottom: '20px' 
    },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
    headerRight: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' },
    goBackBtn: { 
        padding: '8px 16px', 
        border: '1px solid #e0e0e0', 
        background: '#fff', 
        cursor: 'pointer', 
        borderRadius: '8px', 
        fontWeight: '600', 
        color: '#666',
        fontSize: '14px',
        transition: 'all 0.2s ease'
    },
    mainTitle: { fontSize: '24px', fontWeight: '900', color: '#1a1a1a', margin: 0 },
    langSelector: { display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '12px' },
    langBtn: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', fontWeight: '700', color: '#888' },
    langBtnActive: { background: '#fff', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    rightControls: { 
        display: 'flex', 
        gap: '10px', 
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%'
    },
    studentSelect: { 
        padding: '8px 12px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        background: '#fff',
        cursor: 'pointer',
        width: '100%',
        minWidth: 'auto'
    },
    filterBar: { display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '12px', width: '100%' },
    periodBtn: { 
        padding: '8px 16px', 
        border: 'none', 
        background: 'transparent', 
        cursor: 'pointer', 
        borderRadius: '8px', 
        fontWeight: '700', 
        color: '#888',
        flex: 1,
        textAlign: 'center'
    },
    periodBtnActive: { background: '#fff', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    reportCard: { 
        background: '#fff', 
        borderRadius: '24px', 
        border: '1px solid #eee', 
        padding: '20px', 
        marginBottom: '30px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        width: '100%'
    },
    cardTop: { 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '15px',
        marginBottom: '25px' 
    },
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
    bentoGrid: { 
        display: 'flex', 
        flexDirection: 'column',
        gap: '20px' 
    },
    gridItemLarge: { 
        flex: 'none',
        background: '#fcfcfc', 
        padding: '15px', 
        borderRadius: '24px', 
        border: '1px solid #f0f0f0',
        width: '100%'
    },
    gridItemSmall: { 
        flex: 'none',
        background: '#fcfcfc', 
        padding: '15px', 
        borderRadius: '24px', 
        border: '1px solid #f0f0f0', 
        textAlign: 'center',
        width: '100%'
    },
    chartTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#444' },
    emptyState: { textAlign: 'center', padding: '50px', color: '#ccc' },
    floatingPrintButton: {
        position: 'fixed',
        bottom: '100px',
        left: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
    },
    floatingTopButton: {
        position: 'fixed',
        bottom: '30px',
        left: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
    }
};