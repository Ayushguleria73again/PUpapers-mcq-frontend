'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChevronRight, RefreshCcw, XCircle, Info, Trophy, Layout, BookOpen, Lightbulb, Sparkles, BrainCircuit } from 'lucide-react';
import styles from './QuizInterface.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
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
          setQuestions(data);
        }
      } catch (err) {
        console.error('Failed to fetch questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subjectSlug]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, showResult, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (index: number) => setSelectedOption(index);

  const saveResult = async (finalScore: number) => {
    if (questions.length === 0) return;
    setSavingResult(true);
    const subjectId = questions[0].subject._id;
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ subjectId, score: finalScore, totalQuestions: questions.length })
        });
    } catch (err) { console.error('Failed to save result', err); }
    finally { setSavingResult(false); }
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

  const handleNext = () => {
    const newAnswers = [...userAnswers];
    newAnswers.push(selectedOption !== null ? selectedOption : -1);
    setUserAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, index) => { if (answer === questions[index].correctOption) finalScore++; });
      setScore(finalScore);
      setShowResult(true);
      saveResult(finalScore);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0); setSelectedOption(null); setScore(0); setUserAnswers([]); setShowResult(false); setTimeLeft(180);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
            <div className="loader-pro" />
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em' }}>PREPARING WORKSPACE...</p>
        </div>
        <style jsx>{`.loader-pro { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top: 3px solid #FF6B00; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (showResult) {
    return (
      <div className={styles.quizContainer} style={{ background: '#f8fafc', padding: '120px 20px' }}>
        <EditorStyles />
        <motion.div 
          className={styles.quizCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '950px', padding: '4rem' }}
        >
          <div className={styles.results}>
            <div className="congrats-badge">
                <Trophy size={48} color="#FF6B00" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '1rem 0 0.5rem' }}>Performance Analysis</h1>
            <p style={{ color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>Subject: <span style={{ color: '#0f172a', fontWeight: 700 }}>{questions[0]?.subject.name}</span></p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                <div className="stat-card">
                    <span className="stat-label">Total Score</span>
                    <span className="stat-value">{score} <small>/ {questions.length}</small></span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Time Spent</span>
                    <span className="stat-value">{formatTime(180 - timeLeft)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f1f5f9' }}>
                    <BookOpen size={24} color="#FF6B00" />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 850, color: '#0f172a' }}>Standardized Solution Guide</h2>
                </div>

                {questions.map((q, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === q.correctOption;
                    return (
                        <div key={q._id} className="textbook-question">
                            <div className="q-header">
                                <span className={`q-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                                    {isCorrect ? '✓ Correct' : userAnswer === -1 ? '⚠ Skipped' : '✕ Incorrect'}
                                </span>
                                <span className="q-number">Question {index + 1}</span>
                            </div>

                            <div className="q-body tiptap-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {q.text}
                                </ReactMarkdown>
                            </div>

                            <div className="options-summary">
                                {q.options.map((opt, idx) => {
                                    const isCorrectOpt = idx === q.correctOption;
                                    const isUserChoice = idx === userAnswer;
                                    return (
                                        <div key={idx} className={`opt-row ${isCorrectOpt ? 'is-correct' : ''} ${isUserChoice && !isCorrect ? 'is-wrong' : ''}`}>
                                            <span className="opt-letter">{optionLetters[idx]}</span>
                                            <div className="tiptap-content">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                    {opt}
                                                </ReactMarkdown>
                                            </div>
                                            {isCorrectOpt && <CheckCircle2 size={16} className="opt-icon" />}
                                            {isUserChoice && !isCorrect && <XCircle size={16} className="opt-icon" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {q.explanation && (
                                <div className="expert-explanation">
                                    <div className="expl-header">
                                        <BrainCircuit size={18} />
                                        <span>Expert Logical Steps</span>
                                    </div>
                                    <div className="tiptap-content expl-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                            {q.explanation}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '4rem' }}>
              <button className="btn-primary" onClick={resetQuiz} style={{ height: '56px', padding: '0 2.5rem', borderRadius: '16px', fontWeight: 800 }}>
                Try Practice Again
              </button>
              <Link href="/dashboard" className="btn-secondary" style={{ height: '56px', padding: '0 2.5rem', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                Return to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
        
        <style jsx>{`
            .congrats-badge { width: 80px; height: 80px; background: #fff7ed; border-radius: 24px; display: flex; alignItems: center; justifyContent: center; margin: 0 auto; box-shadow: 0 10px 30px rgba(255, 107, 0, 0.1); }
            .stat-card { background: #fff; padding: 1.5rem; border-radius: 20px; border: 1.5px solid #f1f5f9; text-align: center; }
            .stat-label { display: block; fontSize: 0.75rem; fontWeight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; marginBottom: 0.5rem; }
            .stat-value { fontSize: 1.75rem; fontWeight: 900; color: #0f172a; }
            .stat-value small { fontSize: 1rem; color: #cbd5e1; }
            
            .textbook-question { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 24px; padding: 2rem; marginBottom: 2.5rem; }
            .q-header { display: flex; justify-content: space-between; align-items: center; marginBottom: 1.5rem; }
            .q-number { fontSize: 0.875rem; fontWeight: 800; color: #94a3b8; }
            .q-status { fontSize: 11px; fontWeight: 900; padding: 4px 12px; borderRadius: 100px; text-transform: uppercase; }
            .q-status.correct { background: #ecfdf5; color: #059669; }
            .q-status.incorrect { background: #fef2f2; color: #dc2626; }
            
            .q-body { fontSize: 1.15rem; fontWeight: 700; color: #1e293b; marginBottom: 2rem; }
            
            .options-summary { display: grid; gap: 0.75rem; marginBottom: 2rem; }
            .opt-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; borderRadius: 12px; background: #f8fafc; border: 1.5px solid #f1f5f9; transition: 0.2s; }
            .opt-row.is-correct { background: #f0fdf4; border-color: #10b981; color: #059669; fontWeight: 700; }
            .opt-row.is-wrong { background: #fef2f2; border-color: #ef4444; color: #dc2626; }
            .opt-letter { width: 24px; height: 24px; display: flex; alignItems: center; justifyContent: center; background: rgba(0,0,0,0.05); borderRadius: 6px; fontSize: 11px; fontWeight: 800; }
            .opt-icon { marginLeft: auto; }
            
            .expert-explanation { background: #f0f7ff; border: 1.5px solid #dbeafe; borderRadius: 16px; padding: 1.5rem; }
            .expl-header { display: flex; align-items: center; gap: 8px; fontSize: 0.75rem; fontWeight: 900; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; marginBottom: 1rem; }
            .expl-body { fontSize: 0.95rem; color: #1e3a8a; line-height: 1.7; }
        `}</style>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer} style={{ background: '#f8fafc' }}>
      <EditorStyles />
      <div className="container">
        <motion.div className={styles.quizCard} layout style={{ borderRadius: '32px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.08)' }}>
          <div className={styles.quizHeader}>
            <span className={styles.questionCount} style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'normal' }}>
                CHAPTER ASSESSMENT • <b style={{ color: '#0f172a' }}>{currentQuestion + 1}/{questions.length}</b>
            </span>
            <div className={styles.timer} style={{ background: '#020617', color: 'white', border: 'none' }}>
              <Clock size={14} />
              <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.progressBarContainer} style={{ height: '4px', background: '#f1f5f9' }}>
            <motion.div className={styles.progressBar} initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} style={{ background: '#FF6B00', boxShadow: 'none' }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ minHeight: '350px' }}
            >
              <div className={`${styles.question} tiptap-content`} style={{ fontSize: '1.8rem', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.02em' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {questions[currentQuestion].text}
                </ReactMarkdown>
              </div>
              
              <div className={styles.optionsGrid} style={{ gap: '0.75rem' }}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`}
                    onClick={() => handleOptionSelect(index)}
                    style={{ 
                        padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1.5px solid #f1f5f9', 
                        background: selectedOption === index ? '#020617' : '#fff',
                        color: selectedOption === index ? 'white' : '#475569',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700
                    }}
                  >
                    <span style={{ 
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: selectedOption === index ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                        borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900
                    }}>{optionLetters[index]}</span>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                      {option}
                    </ReactMarkdown>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.quizFooter} style={{ borderTop: '2px solid #f8fafc', marginTop: '3rem' }}>
            <p className={styles.footerHint}><Info size={14} /> Review your choices before proceeding</p>
            <button className="btn-primary" onClick={handleNext} disabled={selectedOption === null} style={{ height: '56px', borderRadius: '16px', padding: '0 2.5rem', fontWeight: 800 }}>
              {currentQuestion === questions.length - 1 ? 'End Assessment' : 'Continue Path'} <ChevronRight size={18} style={{ marginLeft: '8px' }} />
            </button>
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
    .tiptap-content .katex-display { margin: 1.5rem 0; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; overflow-x: auto; text-align: center; }
    .tiptap-content .katex { font-size: 1.15em; color: #0f172a; }
    .tiptap-content strong { color: #000; font-weight: 850; }
    .tiptap-content p { margin: 0; }
    
    /* Dark mode override when needed */
    [data-theme='dark'] .tiptap-content .katex { color: #fff; }
  ` }} />
);
