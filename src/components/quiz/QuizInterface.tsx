'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChevronRight, RefreshCcw, XCircle, Info, Trophy, BookOpen, BrainCircuit, Sparkles } from 'lucide-react';
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

  // Restore State on Mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentQuestion(parsed.currentQuestion || 0);
        setSelectedOption(parsed.selectedOption);
        setUserAnswers(parsed.userAnswers || []);
        setScore(parsed.score || 0);
        setShowResult(parsed.showResult || false);
        setTimeLeft(parsed.timeLeft || 180);
      } catch (e) {
        console.error('Failed to restore quiz state', e);
      }
    }
  }, [storageKey]);

  // Save State on Change
  useEffect(() => {
    if (!loading && questions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({
        currentQuestion,
        selectedOption,
        userAnswers,
        score,
        showResult,
        timeLeft
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
          // Fisher-Yates Shuffle Algorithm for production-grade randomness
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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Initializing Module...</div>;

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (showResult) {
    return (
      <div className={styles.quizContainer}>
        <EditorStyles />
        <motion.div className={styles.quizCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.results}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: '#fff7ed', borderRadius: '24px', marginBottom: '2rem' }}>
                <Trophy size={48} color="#FF6B00" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Practice Summary</h1>
            
            <div className={styles.scoreCircle}>
                <span className={styles.scoreNumber}>{score}<small style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/{questions.length}</small></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target: 100%</span>
            </div>

            <div className={styles.solutionGuide}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem', borderBottom: '2.5px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <BookOpen size={24} color="#0f172a" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Solution Framework</h2>
                </div>

                {questions.map((q, index) => {
                    const isCorrect = userAnswers[index] === q.correctOption;
                    return (
                        <div key={q._id} className={styles.solutionStep}>
                            <div className={styles.stepHeader}>
                                <Sparkles size={14} /> EXPLANATION STEP {index + 1}
                            </div>
                            
                            <div className="tiptap-content" style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {cleanMarkdownForRendering(q.text)}
                                </ReactMarkdown>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', marginBottom: '2rem' }}>
                                {q.options.map((opt, oIdx) => {
                                    const isCorrectOpt = oIdx === q.correctOption;
                                    const isUserPick = oIdx === userAnswers[index];
                                    return (
                                        <div key={oIdx} style={{ 
                                            padding: '0.75rem 1.25rem', borderRadius: '12px', background: isCorrectOpt ? '#f0fdf4' : isUserPick ? '#fef2f2' : '#f8fafc',
                                            border: `1.5px solid ${isCorrectOpt ? '#10b981' : isUserPick ? '#ef4444' : '#f1f5f9'}`,
                                            color: isCorrectOpt ? '#059669' : isUserPick ? '#dc2626' : '#64748b',
                                            fontWeight: (isCorrectOpt || isUserPick) ? 800 : 500,
                                            display: 'flex', gap: '10px'
                                        }}>
                                            <span>{optionLetters[oIdx]}.</span>
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                {cleanMarkdownForRendering(opt)}
                                            </ReactMarkdown>
                                        </div>
                                    );
                                })}
                            </div>

                            {q.explanation && (
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 900, color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                        <BrainCircuit size={14} /> Logical Derivation
                                    </div>
                                    <div className="tiptap-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                            {cleanMarkdownForRendering(q.explanation)}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '4rem' }}>
              <button className="btn-primary" onClick={resetQuiz}>Start New Practice</button>
              <Link href="/dashboard" className="btn-secondary">View Dashboard</Link>
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
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <span className={styles.questionCount}>Assessment • Q{currentQuestion + 1}/{questions.length}</span>
            <div className={styles.timer}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.progressBarContainer}>
            <motion.div className={styles.progressBar} initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className={`${styles.question} tiptap-content`}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {cleanMarkdownForRendering(questions[currentQuestion].text)}
                </ReactMarkdown>
              </div>
              
              <div className={styles.optionsGrid}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button key={index} className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`} onClick={() => setSelectedOption(index)}>
                    <span style={{ 
                        width: '28px', height: '28px', background: selectedOption === index ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                        borderRadius: '8px', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{optionLetters[index]}</span>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                      {cleanMarkdownForRendering(option)}
                    </ReactMarkdown>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.quizFooter}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>* Comprehensive analysis available after completion</p>
            <button className="btn-primary" onClick={handleNext} disabled={selectedOption === null} style={{ padding: '0.75rem 2.5rem', borderRadius: '12px' }}>
              {currentQuestion === questions.length - 1 ? 'End Assessment' : 'Continue Path'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
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
        margin: 2rem 0; 
        padding: 2rem 1.5rem; 
        background: #f8fafc; 
        border-radius: 20px; 
        border: 1px solid #f1f5f9;
        overflow-x: auto;
        text-align: center;
        box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.02);
    }
    .tiptap-content .katex { font-size: 1.2em; color: #0f172a; }
  ` }} />
);
