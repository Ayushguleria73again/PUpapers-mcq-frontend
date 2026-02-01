import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import styles from './PaperView.module.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Ensure KaTeX CSS is imported globally or in layout

interface Question {
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string;
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

    const handleSubmit = () => {
        if (!paper) return;
        if (!confirm('Are you sure you want to submit?')) return;

        let calculatedScore = 0;
        answers.forEach((ans, idx) => {
            if (ans === paper.questions[idx].correctOption) {
                calculatedScore += (paper.questions[idx].marks || 1);
            }
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

    return (
        <div className={styles.paperViewContainer}>
            {/* Sidebar / Topbar for navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <button onClick={() => router.push('/previous-papers')} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className={styles.paperTitle}>{paper.title}</div>
                    <div className={styles.statusBadge}>
                        {submitted ? 'COMPLETED' : 'LIVE'}
                    </div>
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
                            {submitted && q.explanation && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.explanationBox}
                                >
                                    <h4 className={styles.explanationHeader}>
                                        <Clock size={20} /> Explanation
                                    </h4>
                                    <div className={styles.explanationText}>
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                                            {q.explanation}
                                        </ReactMarkdown>
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
        </div>
    );
}
