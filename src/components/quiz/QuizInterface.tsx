'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChevronRight, RefreshCcw, XCircle, Info, Trophy, Layout, ChevronLeft } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

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

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const saveResult = async (finalScore: number) => {
    if (questions.length === 0) return;
    setSavingResult(true);
    const subjectId = questions[0].subject._id;
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                subjectId,
                score: finalScore,
                totalQuestions: questions.length
            })
        });
    } catch (err) {
        console.error('Failed to save result', err);
    } finally {
        setSavingResult(false);
    }
  };

  const finishQuiz = () => {
      let finalAnswers = [...userAnswers];
      if (selectedOption !== null && currentQuestion === finalAnswers.length) {
          finalAnswers.push(selectedOption);
      }
      while (finalAnswers.length < questions.length) {
          finalAnswers.push(-1);
      }
      setUserAnswers(finalAnswers);
      let finalScore = 0;
      finalAnswers.forEach((answer, index) => {
          if (answer === questions[index].correctOption) {
              finalScore++;
          }
      });
      setScore(finalScore);
      setShowResult(true);
      saveResult(finalScore);
  };

  const handleNext = () => {
    if (questions.length === 0) return;
    const newAnswers = [...userAnswers];
    newAnswers.push(selectedOption !== null ? selectedOption : -1);
    setUserAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, index) => {
          if (answer === questions[index].correctOption) finalScore++;
      });
      setScore(finalScore);
      setShowResult(true);
      saveResult(finalScore);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setUserAnswers([]);
    setShowResult(false);
    setTimeLeft(180);
  };

  if (loading) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );
  }

  if (questions.length === 0) {
     return <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
         <Info size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
         <h2 style={{ color: '#0f172a', fontWeight: 800 }}>No practice material found.</h2>
         <p style={{ color: '#64748b' }}>Check back later for new questions in this subject.</p>
     </div>;
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (showResult) {
    return (
      <div className={styles.quizContainer}>
        <EditorStyles />
        <motion.div 
          className={styles.quizCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.results}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <Trophy size={64} color="#FFD700" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))' }} />
            </div>
            <h2 className={styles.question}>Mock Test Report</h2>
            
            <div className={styles.scoreCircle}>
                <div style={{ transform: 'none' }}>
                    <span className={styles.scoreNumber}>{score}/{questions.length}</span>
                    <br />
                    <span className={styles.scoreLabel}>Final Score</span>
                </div>
            </div>
            
            <p className={styles.cardDesc}>
              {savingResult ? "Saving your result..." : 
                (score === questions.length ? "Incredible performance! Perfect score." : "Good progress! Analyze your errors below.")
              }
            </p>

            <div className={styles.detailedResults} style={{ width: '100%', marginTop: '3rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <Layout size={20} color="#FF6B00" />
                    <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Solution Guide</h3>
                </div>

                {questions.map((q, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === q.correctOption;
                    const isSkipped = userAnswer === -1;

                    return (
                        <div key={q._id} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', marginTop: '4px' }}>Q{index + 1}</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }} className="tiptap-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                        {q.text}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '0.6rem' }}>
                                {q.options.map((opt, optIdx) => {
                                    const isCorrectOpt = optIdx === q.correctOption;
                                    const isUserPick = optIdx === userAnswer;
                                    
                                    let borderColor = '#f1f5f9';
                                    let bg = '#f8fafc';
                                    let textColor = '#64748b';
                                    
                                    if (isCorrectOpt) { borderColor = '#10b981'; bg = '#f0fdf4'; textColor = '#059669'; }
                                    else if (isUserPick && !isCorrect) { borderColor = '#ef4444'; bg = '#fef2f2'; textColor = '#dc2626'; }

                                    return (
                                        <div key={optIdx} style={{ 
                                            padding: '0.75rem 1rem', 
                                            borderRadius: '10px', 
                                            fontSize: '0.95rem', 
                                            border: `1.5px solid ${borderColor}`,
                                            background: bg,
                                            color: textColor,
                                            fontWeight: isCorrectOpt || isUserPick ? 700 : 500,
                                            display: 'flex', gap: '10px'
                                        }} className="tiptap-content">
                                            <span style={{ opacity: 0.6 }}>{optionLetters[optIdx]}.</span>
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                {opt}
                                            </ReactMarkdown>
                                        </div>
                                    );
                                })}
                            </div>

                            {q.explanation && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '0.9rem' }} 
                                    className="tiptap-content"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        <Info size={14} /> Comprehensive Explanation
                                    </div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                        {q.explanation}
                                    </ReactMarkdown>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem' }}>
              <button className="btn-primary" onClick={resetQuiz} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCcw size={18} /> Re-Take Test
              </button>
              <Link href="/dashboard" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Dashboard Home
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
      <div className="container" style={{ position: 'relative' }}>
        <motion.div 
            className={styles.quizCard}
            layout
        >
          <div className={styles.quizHeader}>
            <span className={styles.questionCount}>Assessment • Q{currentQuestion + 1}/{questions.length}</span>
            <div className={styles.timer}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)} Remaining</span>
            </div>
          </div>

          <div className={styles.progressBarContainer}>
            <motion.div 
              className={styles.progressBar}
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className={`${styles.question} tiptap-content`}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {questions[currentQuestion].text}
                </ReactMarkdown>
              </div>
              
              <div className={styles.optionsGrid}>
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={index}
                    className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <span style={{ 
                        width: '24px', height: '24px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        borderRadius: '6px', fontSize: '12px', fontWeight: 900,
                        background: selectedOption === index ? '#FF6B00' : '#e2e8f0',
                        color: selectedOption === index ? 'white' : '#64748b',
                        flexShrink: 0
                    }}>
                        {optionLetters[index]}
                    </span>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                      {option}
                    </ReactMarkdown>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.quizFooter}>
            <div className={styles.footerHint}>
                <Info size={14} /> Select the most accurate response
            </div>
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={selectedOption === null}
              style={{ padding: '0.8rem 2.2rem', borderRadius: '14px', fontSize: '1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentQuestion === questions.length - 1 ? 'Complete Test' : 'Next Step'}
                <ChevronRight size={18} />
              </span>
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
    .tiptap-content { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      color: inherit;
    }
    .tiptap-content p { margin: 0; }
    
    .tiptap-content .katex-display { 
      margin: 1.5rem 0; 
      padding: 1.5rem; 
      background: #f8fafc; 
      border-radius: 12px; 
      border: 1px solid #f1f5f9;
      overflow-x: auto;
    }
    .tiptap-content .katex { font-size: 1.1em; }
    
    .tiptap-content h1, .tiptap-content h2 { 
      font-size: 1.4rem; 
      font-weight: 800; 
      color: #0f172a; 
      margin: 1.5rem 0 1rem; 
    }
    
    /* Image Handling */
    .tiptap-content img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 1.5rem 0;
      display: block;
    }
  ` }} />
);
