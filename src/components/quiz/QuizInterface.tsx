'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle2, ChevronRight, RefreshCcw, XCircle, Info, 
  Trophy, BookOpen, BrainCircuit, Sparkles, Layout, BarChart3, Target
} from 'lucide-react';
import styles from './QuizInterface.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { cleanMarkdownForRendering } from '@/utils/markdownCleaner';
import 'katex/dist/katex.min.css';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  subject: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface QuizInterfaceProps {
  subjectSlug?: string;
}

const QuizInterface = ({ subjectSlug }: QuizInterfaceProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); 

  // Persistence Key
  const storageKey = `quiz_state_${subjectSlug}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && subjectSlug) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentQuestion(parsed.currentQuestion || 0);
        setSelectedOption(parsed.selectedOption);
        setUserAnswers(parsed.userAnswers || []);
        setScore(parsed.score || 0);
        setShowResult(parsed.showResult || false);
        setTimeLeft(parsed.timeLeft || 180);
      } catch (e) { console.error(e); }
    }
  }, [storageKey, subjectSlug]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({
        currentQuestion, selectedOption, userAnswers, score, showResult, timeLeft
      }));
    }
  }, [currentQuestion, selectedOption, userAnswers, score, showResult, timeLeft, storageKey, loading, questions]);

  useEffect(() => {
    if (!subjectSlug) {
        setQuestions([]); 
        setLoading(false);
        return;
    }
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/questions?slug=${subjectSlug}`, {
            credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setQuestions(shuffled);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchQuestions();
  }, [subjectSlug]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) finishQuiz();
  }, [timeLeft, showResult, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const finishQuiz = () => {
      let finalAnswers = [...userAnswers];
      if (selectedOption !== null && currentQuestion === finalAnswers.length) finalAnswers.push(selectedOption);
      while (finalAnswers.length < questions.length) finalAnswers.push(-1);
      setUserAnswers(finalAnswers);
      let finalScore = 0;
      finalAnswers.forEach((answer, index) => { if (answer === questions[index].correctOption) finalScore++; });
      setScore(finalScore);
      setShowResult(true);
      saveResult(finalScore);
  };

  const saveResult = async (finalScore: number) => {
    if (questions.length === 0) return;
    setSavingResult(true);
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                subjectId: questions[0].subject._id,
                score: finalScore,
                totalQuestions: questions.length
            })
        });
    } catch (err) { console.error(err); } finally { setSavingResult(false); }
  };

  const handleNext = () => {
    const newAnswers = [...userAnswers];
    newAnswers.push(selectedOption !== null ? selectedOption : -1);
    setUserAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
        finishQuiz();
    }
  };

  const resetQuiz = () => {
    localStorage.removeItem(storageKey);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setUserAnswers([]);
    setShowResult(false);
    setTimeLeft(180);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ marginBottom: '1rem' }}>
                <RefreshCcw size={32} color="#FF6B00" />
            </motion.div>
            <p style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em' }}>SYNCHRONIZING ASSETS...</p>
        </div>
    </div>
  );

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className={styles.quizContainer}>
        <EditorStyles />
        <motion.div className={styles.quizCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className={styles.results}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} style={{ position: 'absolute', top: -10, right: -10, background: '#FF6B00', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900 }}>
                    {accuracy}% QUALIFIED
                </motion.div>
                <div className={styles.scoreCircle}>
                    <BarChart3 size={32} color="#f1f5f9" style={{ position: 'absolute', opacity: 0.1, zIndex: 0 }} />
                    <span className={styles.scoreNumber}>{score}<small>/{questions.length}</small></span>
                    <span className={styles.scoreLabel}>Final Precision</span>
                </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Examination Meta-Report</h1>
            <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '4rem' }}>Subject Mastery Assessment: <b>{questions[0]?.subject.name}</b></p>
            
            <div className={styles.solutionGuide}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '4rem', paddingBottom: '1.5rem', borderBottom: '2px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ background: '#0f172a', padding: '12px', borderRadius: '16px' }}>
                        <BookOpen size={24} color="#ffffff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Technical Solution Framework</h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Detailed logical breakdown and dimensional analysis</p>
                    </div>
                </div>

                {questions.map((q, index) => {
                    const isCorrect = userAnswers[index] === q.correctOption;
                    return (
                        <motion.div key={q._id} className={styles.solutionStep} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <div className={styles.stepHeader}>
                                <div style={{ background: isCorrect ? '#ecfdf5' : '#fef2f2', color: isCorrect ? '#059669' : '#dc2626', padding: '4px 12px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: 900 }}>
                                    {isCorrect ? 'VALIDATED' : 'DISCREPANCY'}
                                </div>
                                <span>LOGICAL MODULE {index + 1}</span>
                            </div>
                            
                            <div className="tiptap-content" style={{ fontWeight: 800, fontSize: '1.35rem', color: '#1e293b', marginBottom: '2.5rem' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {cleanMarkdownForRendering(q.text)}
                                </ReactMarkdown>
                            </div>

                            <div style={{ display: 'grid', gap: '12px', marginBottom: '3rem' }}>
                                {q.options.map((opt, oIdx) => {
                                    const isCorrectOpt = oIdx === q.correctOption;
                                    const isUserPick = oIdx === userAnswers[index];
                                    return (
                                        <div key={oIdx} style={{ 
                                            padding: '1.25rem 1.5rem', borderRadius: '20px', 
                                            background: isCorrectOpt ? '#f0fdf4' : isUserPick ? '#fef2f2' : 'rgba(0,0,0,0.01)',
                                            border: `1.5px solid ${isCorrectOpt ? '#10b981' : isUserPick ? '#ef4444' : 'transparent'}`,
                                            display: 'flex', alignItems: 'center', gap: '15px'
                                        }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#64748b' }}>
                                                {optionLetters[oIdx]}
                                            </div>
                                            <div className="tiptap-content" style={{ color: isCorrectOpt ? '#059669' : isUserPick ? '#dc2626' : '#475569', fontWeight: isCorrectOpt ? 700 : 500 }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                    {cleanMarkdownForRendering(opt)}
                                                </ReactMarkdown>
                                            </div>
                                            {isCorrectOpt && <CheckCircle2 size={18} color="#10b981" style={{ marginLeft: 'auto' }} />}
                                            {isUserPick && !isCorrect && <XCircle size={18} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {q.explanation && (
                                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', fontWeight: 900, color: '#334155', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        <BrainCircuit size={16} color="#FF6B00" /> Expert Derivation Analysis
                                    </div>
                                    <div className="tiptap-content" style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.75 }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                            {cleanMarkdownForRendering(q.explanation)}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '6rem' }}>
              <button className="btn-primary" onClick={resetQuiz} style={{ height: '64px', padding: '0 3rem', borderRadius: '20px', fontWeight: 800, fontSize: '1rem', boxShadow: '0 20px 40px -10px rgba(255, 107, 0, 0.2)' }}>
                Re-initialize Practice
              </button>
              <Link href="/dashboard" className="btn-secondary" style={{ height: '64px', padding: '0 3rem', borderRadius: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                Mastery Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer}>
      <EditorStyles />
      <div className="container">
        <motion.div className={styles.quizCard} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className={styles.quizHeader}>
            <div className={styles.questionCount}>
                <Target size={14} color="#FF6B00" />
                <span>PHASE <b>{currentQuestion + 1}</b> OF <b>{questions.length}</b></span>
            </div>
            <div className={styles.timer}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.progressBarContainer}>
            <motion.div className={styles.progressBar} initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} transition={{ type: "spring", stiffness: 50 }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <div className={`${styles.question} tiptap-content`}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {cleanMarkdownForRendering(questions[currentQuestion].text)}
                </ReactMarkdown>
              </div>
              
              <div className={styles.optionsGrid}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button key={index} className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`} onClick={() => setSelectedOption(index)}>
                    <div style={{ 
                        width: '36px', height: '36px', background: selectedOption === index ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)', 
                        borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}>{optionLetters[index]}</div>
                    <div style={{ flex: 1 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                        {cleanMarkdownForRendering(option)}
                        </ReactMarkdown>
                    </div>
                    {selectedOption === index && (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Sparkles size={18} color="#FFD700" />
                        </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.quizFooter}>
            <div className={styles.footerHint}>
                <Info size={14} />
                <span>Confirm selection to advance module</span>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={handleNext} disabled={selectedOption === null} style={{ height: '64px', borderRadius: '20px', padding: '0 3rem', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentQuestion === questions.length - 1 ? 'Finalize Attempt' : 'Sync Next Logic'} <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizInterface;

const EditorStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .tiptap-content { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }
    .tiptap-content p { margin: 0; }
    .tiptap-content .katex-display { 
        margin: 2.5rem 0; 
        padding: 2.5rem 2rem; 
        background: rgba(0, 50, 100, 0.02); 
        border-radius: 28px; 
        border: 1px solid rgba(0, 0, 0, 0.03);
        overflow-x: auto;
        text-align: center;
    }
    .tiptap-content .katex { font-size: 1.25em; color: #0f172a; }
    
    /* Global Button Overrides for this component */
    .btn-primary { 
        background: #020617 !important; 
        color: white !important; 
        border: none !important; 
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    .btn-primary:hover:not(:disabled) { 
        background: #0f172a !important; 
        transform: translateY(-2px);
        box-shadow: 0 20px 40px -10px rgba(2, 6, 23, 0.2);
    }
    .btn-secondary {
        background: white !important;
        color: #020617 !important;
        border: 1.5px solid rgba(0, 0, 0, 0.04) !important;
        transition: all 0.3s ease !important;
    }
    .btn-secondary:hover {
        background: #f8fafc !important;
        border-color: #020617 !important;
    }
  ` }} />
);
