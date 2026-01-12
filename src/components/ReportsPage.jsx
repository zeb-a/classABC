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

/* ================= 🧠 TEACHER-LIKE TEXT GENERATION ================= */

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

function generateTeacherNote(student, behavior, period, language = 'en') {
    const level = classifyPerformance(behavior);
    const posList = topItems(behavior.positive.byCard, 2);
    const negList = topItems(behavior.negative.byCard, 1);
    const timeFrame = period === 'week' ? 'this past week' : (period === 'month' ? 'the last month' : 'this year');
    
    // English templates - realistic teacher feedback
    const enTemplates = {
        STRONG: [
            `${student.name} has demonstrated exceptional effort and leadership qualities ${timeFrame}. Their consistent positive contributions to ${posList || 'class activities'} have been truly impressive. Keep up the excellent work!`,
            `${student.name} continues to be a role model for their peers. Their dedication to ${posList || 'positive classroom behavior'} is commendable and reflects strong character development.`,
            `I'm delighted to share that ${student.name} has excelled in ${posList || 'multiple areas of classroom participation'}. Their growth mindset and enthusiasm are evident in everything they do.`
        ],
        MIXED: [
            `${student.name} is showing promise and making progress ${timeFrame}. While they demonstrate strength in ${posList || 'certain areas'}, there are opportunities to build consistency across all aspects of their learning.`,
            `${student.name} has had moments of great achievement in ${posList || 'various subjects'}, though they would benefit from focusing on developing stronger habits in other areas.`,
            `${student.name} is on a positive trajectory. With continued effort in ${negList || 'targeted areas'}, I anticipate seeing even greater improvements ahead.`
        ],
        CONCERN: [
            `${student.name} requires additional support ${timeFrame}. I encourage focusing on positive interactions like ${posList || 'helping classmates'} and maintaining better focus during instruction.`,
            `${student.name} is facing some challenges that we're actively addressing together. Encouraging ${posList || 'positive peer relationships'} will be important for their continued growth.`,
            `While ${student.name} shows potential, they need to develop stronger self-regulation skills. We're working closely with them to address ${negList || 'behavioral concerns'} constructively.`
        ]
    };
    
    // Chinese templates - realistic teacher feedback
    const zhTemplates = {
        STRONG: [
            `${student.name}在${timeFrame}展现了卓越的努力和领导才能。他们在${posList || '课堂活动'}中的持续积极贡献令人印象深刻。请继续保持出色的表现！`,
            `${student.name}继续成为同龄人的榜样。他们对${posList || '课堂积极行为'}的投入值得称赞，体现了优秀的品格发展。`,
            `我很高兴地分享，${student.name}在${posList || '课堂参与的多个方面'}表现出色。他们的成长心态和热情体现在所做的每件事中。`
        ],
        MIXED: [
            `${student.name}正在取得进步并显示出潜力${timeFrame}。虽然他们在${posList || '某些领域'}表现出优势，但在各个方面建立一致性仍有提升空间。`,
            `${student.name}在${posList || '各个科目'}中有过出色的成就时刻，尽管他们在其他领域受益于培养更强的习惯。`,
            `${student.name}正处于积极的发展轨道上。通过在${negList || '目标领域'}继续努力，我期待看到更大的进步。`
        ],
        CONCERN: [
            `${student.name}需要额外的支持${timeFrame}。我鼓励他们专注于像${posList || '帮助同学'}这样的积极互动，并在指导期间保持更好的专注力。`,
            `${student.name}面临一些我们正在共同积极解决的挑战。鼓励${posList || '积极的同伴关系'}对他们持续成长很重要。`,
            `虽然${student.name}展示了潜力，但他们需要培养更强的自我调节能力。我们正在与他们密切合作，以建设性地解决${negList || '行为问题'}。`
        ]
    };

    const templates = language === 'zh' ? zhTemplates : enTemplates;
    
    // Select a random template from the appropriate category
    const templateCategory = templates[level];
    if (templateCategory && templateCategory.length > 0) {
        const randomIndex = Math.floor(Math.random() * templateCategory.length);
        return templateCategory[randomIndex];
    }
    
    return templates['MIXED'][0] || "Student is making satisfactory progress."; // fallback
}

/* ================= 📊 MAIN COMPONENT ================= */

export default function ReportsPage({ activeClass, studentId, isParentView }) {
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
        return {
            positive: { total: Math.max(0, student.score), byCard: { "Participation": 5, "Kindness": 3 } },
            negative: { total: Math.min(0, student.score), byCard: { "Off-task": 1 } }
        };
    };

    const t = translations[language]; // shorthand for translations

    return (
        <div style={styles.container}>
            <div style={styles.header}>
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

            {displayStudents.length === 0 ? (
                <div style={styles.emptyState}>{t.emptyState}</div>
            ) : (
                displayStudents.map(student => {
                    const stats = getStudentStats(student);
                    const teacherNote = generateTeacherNote(student, stats, timePeriod, language);

                    // Chart Data
                    const doughnutData = {
                        labels: [t.positive, t.needsWork],
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
                                            data={{
                                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                                datasets: [{
                                                    label: t.positive,
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
                                    <h4 style={styles.chartTitle}>{t.ratio}</h4>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', flexDirection: 'column', gap: '15px', alignItems: 'flex-start' },
    mainTitle: { fontSize: '24px', fontWeight: '900', color: '#1a1a1a', margin: 0 },
    langSelector: { display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '12px', marginBottom: '10px' },
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