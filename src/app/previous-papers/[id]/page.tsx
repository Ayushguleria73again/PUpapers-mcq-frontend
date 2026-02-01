'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import styles from './PaperView.module.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Ensure KaTeX CSS is imported globally or in layout

interface Question {
    _id: string;
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string; // Standard Explanation
    marks?: number;
}

interface Paper {
    _id: string;
    title: string;
    year: number;
    questions: Question[];
}

export default function PaperViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [paper, setPaper] = useState<Paper | null>(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]); // Array of selected options
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [aiExplanations, setAiExplanations] = useState<Record<string, { content: string; loading: boolean }>>({});
    
    // Exam Mode States
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [examStats, setExamStats] = useState<{
        correct: number;
        wrong: number; 
        unattempted: number; 
        totalMarks: number;
        maxMarks: number;
        percentage: number;
    } | null>(null);

    
    // Timer Logic
    useEffect(() => {
        if (loading || submitted || timeLeft <= 0) return;
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleConfirmSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, submitted, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Initial fetch
    useEffect(() => {
        if (!id) return;
        const fetchPaper = async () => {
            try {
                const data = await apiFetch<Paper>(`/content/papers/${id}`);
                setPaper(data);
                setAnswers(new Array(data.questions.length).fill(-1));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPaper();
    }, [id]);

    const handleOptionSelect = (optionIndex: number) => {
        if (submitted) return;
        const newAnswers = [...answers];
        newAnswers[currentQIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const getAIExplanation = async (e: React.MouseEvent, questionId: string, text: string, options: string[], correctOption: number, userSelected: number) => {
        e.stopPropagation(); // Prevent bubbling if container is clickable
        if (aiExplanations[questionId]?.loading) return;

        setAiExplanations(prev => ({
            ...prev,
            [questionId]: { content: '', loading: true }
        }));

        try {
            const data = await apiFetch<{ explanation: string }>('/content/explain', {
                method: 'POST',
                body: JSON.stringify({ 
                    questionId, 
                    userChoice: userSelected,
                    questionText: text,
                    options: options,
                    correctOption: correctOption
                }),
            });

            // Sanitize smart quotes
            const cleanContent = data.explanation
                .replace(/[“”]/g, '"')
                .replace(/[‘’]/g, "'");
                
            setAiExplanations(prev => ({
                ...prev,
                [questionId]: { content: cleanContent, loading: false }
            }));
        } catch (err: unknown) {
             const error = err as Error;
            setAiExplanations(prev => ({
                ...prev,
                [questionId]: { content: `Error: ${error.message || "Failed to generate AI explanation"}`, loading: false }
            }));
        }
    };

    const handleSubmit = () => {
        if (!paper || submitted) return;
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = () => {
        if (!paper) return;
        setShowConfirmModal(false);

        let calculatedScore = 0;
        let correctCount = 0;
        let wrongCount = 0;

        answers.forEach((ans, idx) => {
            if (ans !== -1) { // Attempted
                 if (ans === paper.questions[idx].correctOption) {
                    // Correct: +5 (User requested +5 instead of +4)
                    calculatedScore += 5;
                    correctCount++;
                } else {
                    // Wrong: -1
                    calculatedScore -= 1;
                    wrongCount++;
                }
            }
        });

        // Ensure score doesn't effectively go below user expectations if we want a floor? 
        // Usually competitive exams allow negative totals. keeping as is.

        const maxMarks = paper.questions.length * 5;
        const unattempted = paper.questions.length - (correctCount + wrongCount);
        const percentage = Math.max(0, (calculatedScore / maxMarks) * 100);

        setExamStats({
            correct: correctCount,
            wrong: wrongCount,
            unattempted,
            totalMarks: calculatedScore,
            maxMarks,
            percentage
        });

        setScore(calculatedScore);
        setSubmitted(true);
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FF6B00', '#2563eb', '#22c55e']
        });
    };

    // Components for ReactMarkdown to handle styling
    const markdownComponents = {
        p: ({ ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
        img: ({ ...props }) => <img className="rounded-lg max-h-64 my-4 border border-slate-200" {...props} />,
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: 40, height: 40, border: '4px solid #FF6B00', borderTopColor: 'transparent', borderRadius: '50%' }}
            />
        </div>
    );

    if (!paper) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <AlertTriangle className="text-red-500" size={48} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Paper not found</h1>
            <button onClick={() => router.back()} style={{ color: '#FF6B00', textDecoration: 'underline' }}>Go Back</button>
        </div>
    );

    const q = paper.questions[currentQIndex];
    const isLastQ = currentQIndex === paper.questions.length - 1;

    // ... (rest of the component)

    // ... (rest of the component)

    return (
        <div className={styles.paperViewContainer}>
            {/* Mobile Header Overlay */}
            <div className={styles.mobileHeader}>
                 <button onClick={() => router.push('/previous-papers')} className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </button>
                <div className={styles.mobileTitle}>{paper.title}</div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className={`${styles.menuBtn} ${isSidebarOpen ? styles.menuBtnActive : ''}`}
                >
                    {isSidebarOpen ? <XCircle size={24} /> : <div style={{display:'flex', gap:'2px', alignItems:'center'}}><span style={{fontSize:'0.8rem', fontWeight:700}}>Q-GRID</span> <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px', width:'14px'}}><div style={{width:'6px', height:'6px', background:'currentColor', borderRadius:'1px'}}></div><div style={{width:'6px', height:'6px', background:'currentColor', borderRadius:'1px'}}></div><div style={{width:'6px', height:'6px', background:'currentColor', borderRadius:'1px'}}></div><div style={{width:'6px', height:'6px', background:'currentColor', borderRadius:'1px'}}></div></div></div>}
                </button>
            </div>

            {/* Sidebar / Topbar for navigation */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <button onClick={() => router.push('/previous-papers')} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className={styles.paperTitle}>{paper.title}</div>
                    <div className={styles.statusBadge}>
                        {submitted ? 'COMPLETED' : 'LIVE'}
                    </div>
                    {/* Timer Display in Header */}
                    {!submitted && (
                        <div className={`${styles.timerDisplay} ${timeLeft < 300 ? styles.timerCritical : ''}`}>
                            <Clock size={16} />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
                
                {/* Question Grid */}
                <div className={styles.questionGrid}>
                    <div className={styles.gridContainer}>
                        {paper.questions.map((_, idx) => {
                            const isAnswered = answers[idx] !== -1;
                            const isCurrent = currentQIndex === idx;
                            
                            let btnClass = styles.qBtn;
                            if (isCurrent) btnClass += ` ${styles.qBtnCurrent}`;
                            else if (submitted) {
                                const isCorrect = answers[idx] === paper.questions[idx].correctOption;
                                btnClass += ` ${isCorrect ? styles.qBtnCorrect : styles.qBtnWrong}`;
                            }
                            else if (isAnswered) btnClass += ` ${styles.qBtnAnswered}`;

                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentQIndex(idx)}
                                    className={btnClass}
                                >
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Submit Action or Score */}
                <div className={styles.sidebarFooter}>
                    {!submitted ? (
                        <button 
                            onClick={handleSubmit}
                            className={styles.submitBtn}
                        >
                            Submit Test
                        </button>
                    ) : (
                        <div className={styles.scoreCard}>
                            <div className={styles.scoreLabel}>Final Score</div>
                            <div className={styles.scoreValue}>{score} / {paper.questions.length}</div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Question Area */}
            <main className={styles.mainContent}>
                {/* Progress Bar */}
                <div className={styles.progressBarTrack}>
                    <motion.div 
                        className={styles.progressBarFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQIndex + 1) / paper.questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className={styles.contentScroll}>
                     <div className={styles.questionContainer}>
                        <motion.div 
                            key={currentQIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.qMeta}>Question {currentQIndex + 1}</div>
                            
                            {/* Question Text with Markdown */}
                            <div className={styles.qText}>
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                                    {q.text}
                                </ReactMarkdown>
                            </div>

                            <div className={styles.optionsGrid}>
                                {q.options.map((opt, idx) => {
                                    const isSelected = answers[currentQIndex] === idx;
                                    const isCorrect = q.correctOption === idx;
                                    
                                    let optionClass = styles.optionCard;
                                    
                                    if (submitted) {
                                        if (isCorrect) optionClass += ` ${styles.optionCorrect}`;
                                        else if (isSelected && !isCorrect) optionClass += ` ${styles.optionWrong}`;
                                        else optionClass += ` ${styles.optionDimmed}`;
                                    } else if (isSelected) {
                                        optionClass += ` ${styles.optionSelected}`;
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={optionClass}
                                        >
                                            <div className={styles.optionContent}>
                                                <div className={styles.optionLetter}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <div className={styles.optionText} style={{ width: '100%' }}>
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ ...markdownComponents, p: (p) => <p style={{margin: 0}} {...p} /> }}>
                                                        {opt}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            
                                            {submitted && isCorrect && <CheckCircle className="text-green-600 flex-shrink-0" size={24} />}
                                            {submitted && isSelected && !isCorrect && <XCircle className="text-red-500 flex-shrink-0" size={24} />}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Explanation Section */}
                            {submitted && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {q.explanation && (
                                        <div className={styles.explanationBox}>
                                            <h4 className={styles.explanationHeader}>
                                                <Clock size={20} /> Explanation
                                            </h4>
                                            <div className={styles.explanationText}>
                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                                                    {q.explanation}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Explanation Button / Section */}
                                    <div className={styles.aiExplanationSection}>
                                        {!aiExplanations[q._id] ? (
                                            <button 
                                                className={styles.aiBtn}
                                                onClick={(e) => getAIExplanation(e, q._id, q.text, q.options, q.correctOption, answers[currentQIndex])}
                                            >
                                                <Sparkles size={16} /> Explain with AI
                                            </button>
                                        ) : (
                                            <div className={styles.aiResponseBox}>
                                                <div className={styles.aiBadge}>
                                                    <Sparkles size={12} /> AI TUTORING SESSION
                                                </div>
                                                {aiExplanations[q._id].loading ? (
                                                    <div className={styles.aiLoading}>
                                                        <div className={styles.sparkleLoader}></div>
                                                        <p>Reasoning through the solution...</p>
                                                    </div>
                                                ) : (
                                                    <div className={styles.explanationText}>
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                                                            {aiExplanations[q._id].content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                     </div>
                </div>

                {/* Footer Controls */}
                <div className={styles.footerControls}>
                    <div className={styles.controlBtnWrapper}>
                        <button 
                            disabled={currentQIndex === 0}
                            onClick={() => setCurrentQIndex(prev => prev - 1)}
                            className={styles.navBtn}
                        >
                            <ArrowLeft size={18} /> Previous
                        </button>

                        {!isLastQ ? (
                            <button 
                                onClick={() => setCurrentQIndex(prev => prev + 1)}
                                className={styles.primaryActionBtn}
                            >
                                Next Question <ArrowRight size={18} />
                            </button>
                        ) : !submitted ? (
                            <button 
                                onClick={handleSubmit}
                                className={`${styles.primaryActionBtn} ${styles.finishBtn}`}
                            >
                                Finish Test <CheckCircle size={18} />
                            </button>
                        ) : null}
                    </div>
                </div>
            </main>


            {/* Custom Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
                        <motion.div 
                            className={styles.modalContent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ // Icon wrapper
                                width: 60, height: 60, background: '#fff7ed', borderRadius: '50%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 1rem', color: '#FF6B00' 
                            }}>
                                <AlertTriangle size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Submit Test?</h3>
                            <p style={{ color: '#64748b', lineHeight: 1.5 }}>
                                You are about to submit your answers. You won't be able to change them afterwards.
                            </p>
                            <div className={styles.modalActions}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setShowConfirmModal(false)}>
                                    Cancel
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnConfirm}`} onClick={handleConfirmSubmit}>
                                    Yes, Submit
                                </button>
                            </div>
                        </motion.div>
                    </div>

                )}
            </AnimatePresence>

            {/* Test Result Summary Modal */}
            <AnimatePresence>
                {submitted && examStats && (
                    <div className={styles.modalOverlay} style={{ backdropFilter: 'blur(8px)' }}>
                        <motion.div 
                            className={styles.resultModalContent}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                        >
                            <div className={styles.resultHeader}>
                                <div className={styles.resultTitle}>Test Completed</div>
                                <div className={styles.resultScore}>
                                    {examStats.totalMarks}
                                    <span className={styles.resultMax}>/{examStats.maxMarks}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                    {examStats.percentage.toFixed(1)}% Score
                                </div>
                                <Sparkles className={styles.confettiIcon} size={48} />
                            </div>

                            <div className={styles.resultBody}>
                                <div className={styles.statGrid}>
                                    <div className={`${styles.statItem} ${styles.statCorrect}`}>
                                        <div className={styles.statValue}>{examStats.correct}</div>
                                        <div className={styles.statLabel}>Correct</div>
                                    </div>
                                    <div className={`${styles.statItem} ${styles.statWrong}`}>
                                        <div className={styles.statValue}>{examStats.wrong}</div>
                                        <div className={styles.statLabel}>Wrong</div>
                                    </div>
                                    <div className={`${styles.statItem} ${styles.statUnattempted}`}>
                                        <div className={styles.statValue}>{examStats.unattempted}</div>
                                        <div className={styles.statLabel}>Skipped</div>
                                    </div>
                                </div>

                                <div className={styles.resultActions}>
                                    <button 
                                        className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                        onClick={() => router.push('/previous-papers')}
                                    >
                                        Exit
                                    </button>
                                    <button 
                                        className={`${styles.actionBtn} ${styles.primaryBtn}`}
                                        onClick={() => setExamStats(null)} // Close modal to view answers
                                    >
                                        Review Answers
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
