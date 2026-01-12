import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';

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
        // Create more realistic mock data based on student score
        const basePositive = Math.max(0, student.score || 10);
        const baseNegative = Math.min(0, -(Math.abs(student.score || 5)));
        
        // Define Wow and NoNo card types for better categorization
        const wowCards = ["Great work", "Homework", "Helping others", "Participation", "Kindness"];
        const nonoCards = ["Off-task", "Disrespectful", "Late", "Incomplete work", "Disruptive"];
        
        // Distribute points among Wow cards
        const wowPoints = {};
        wowCards.forEach((card, i) => {
            wowPoints[card] = Math.max(1, Math.floor(basePositive / wowCards.length) + i);
        });
        
        // Distribute points among NoNo cards
        const nonoPoints = {};
        nonoCards.forEach((card, i) => {
            nonoPoints[card] = Math.max(1, Math.floor(Math.abs(baseNegative) / nonoCards.length) + i);
        });
        
        return {
            positive: { 
                total: basePositive, 
                byCard: wowPoints,
                wowCount: Object.keys(wowPoints).length  // Number of different Wow card types
            },
            negative: { 
                total: baseNegative, 
                byCard: nonoPoints,
                nonoCount: Object.keys(nonoPoints).length  // Number of different NoNo card types
            }
        };
    };

    // 3. MOCK DAILY BEHAVIOR DATA AGGREGATION FUNCTION
    const getDailyBehaviorData = (student) => {
        // This would come from actual data in a real implementation
        // For now, generating mock data that sums all behavior types per day
        // Simulating data that might come from a history collection
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        // Generate data based on student's actual behavior data if available
        // For demo purposes, we'll create different values for each student
        const baseValue = student.score || 10;
        const data = daysOfWeek.map((day, index) => {
            // Vary the data based on day and student ID to make it look realistic
            const dayFactor = (index + 1) * 2;
            const studentFactor = parseInt(student.id) % 5;
            return Math.max(1, Math.floor(baseValue + dayFactor + studentFactor + (Math.random() * 5)));
        });
        
        return {
            labels: daysOfWeek,
            datasets: [{
                label: 'Total Points',
                data: data,
                backgroundColor: '#4CAF50',
                borderRadius: 8
            }]
        };
    };

    const t = translations[language]; // shorthand for translations

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    {/* Go Back Button */}
                    <button 
                        onClick={onBack || (() => window.history.back())}
                        style={styles.goBackBtn}
                        aria-label="Go back"
                    >
                        ← Back
                    </button>
                    
                    <h1 style={styles.mainTitle}>
                        {t.mainTitle(isParentView, activeClass?.name)}
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
                
                {/* Time Period Toggles - moved to top right */}
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

            {displayStudents.length === 0 ? (
                <div style={styles.emptyState}>{t.emptyState}</div>
            ) : (
                displayStudents.map(student => {
                    const stats = getStudentStats(student);
                    const teacherNote = generateTeacherNote(student, stats, timePeriod, language);

                    // Chart Data - Now using actual Wow/NoNo counts
                    const doughnutData = {
                        labels: [
                            language === 'zh' ? '哇卡' : 'Wow Cards', 
                            language === 'zh' ? '诺诺卡' : 'NoNo Cards'
                        ],
                        datasets: [{
                            data: [stats.positive.wowCount || 0, stats.negative.nonoCount || 0],
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
                                    <div style={styles.scoreLabel}>{t.totalPoints}</div>
                                </div>
                            </div>

                            {/* TEACHER FEEDBACK BOX */}
                            <div style={styles.aiInsightSection}>
                                <div style={styles.aiPulse} />
                                <p style={styles.aiText}><strong>{t.aiSummary}</strong> {teacherNote}</p>
                            </div>

                            {/* BENTO GRID FOR CHARTS */}
                            <div style={styles.bentoGrid}>
                                <div style={styles.gridItemLarge}>
                                    <h4 style={styles.chartTitle}>{t.behaviorDistribution}</h4>
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

                                <div style={styles.gridItemSmall}>
                                    <h4 style={styles.chartTitle}>{t.ratio}</h4>
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
    container: { padding: '40px', background: '#fff', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
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