'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChevronRight, RefreshCcw, XCircle, Info, Trophy, Layout } from 'lucide-react';
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
    if (selectedOption !== null) {
      newAnswers.push(selectedOption);
    } else {
      newAnswers.push(-1); // Skipped
    }
    setUserAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, index) => {
          if (answer === questions[index].correctOption) {
              finalScore++;
          }
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
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Quiz...</div>;
  }

  if (questions.length === 0) {
     return <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>No questions found for this subject.</div>;
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (showResult) {
    return (
      <div className={styles.quizContainer}>
        <EditorStyles />
        <motion.div 
          className={styles.quizCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.results}>
            <Trophy size={64} color="#FF6B00" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className={styles.question}>Quiz Completed!</h2>
            <div className={styles.scoreCircle}>
                <span className={styles.scoreNumber}>{score}/{questions.length}</span>
                <span className={styles.scoreLabel}>Final Score</span>
            </div>
            
            <p className={styles.cardDesc}>
              {savingResult ? "Saving your result..." : 
                (score === questions.length ? "Perfect! Excellent work." : "Good effort! Review your answers below.")
              }
            </p>

            <div className={styles.detailedResults} style={{ width: '100%', marginTop: '2rem', textAlign: 'left' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Detailed Analysis</h3>
                {questions.map((q, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === q.correctOption;
                    const isSkipped = userAnswer === -1;

                    return (
                        <div key={q._id} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.8rem' }} className="tiptap-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {`${index + 1}. ${q.text}`}
                                </ReactMarkdown>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {q.options.map((opt, optIdx) => {
                                    let optionStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #ddd' };
                                    if (optIdx === q.correctOption) {
                                        optionStyle = { ...optionStyle, border: '1px solid #2ecc71', background: '#eafaf1', color: '#2ecc71', fontWeight: 'bold' };
                                    } else if (optIdx === userAnswer && !isCorrect) {
                                        optionStyle = { ...optionStyle, border: '1px solid #e74c3c', background: '#fdedec', color: '#e74c3c' };
                                    }

                                    return (
                                        <div key={optIdx} style={optionStyle} className="tiptap-content">
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                {`${optionLetters[optIdx]}. ${opt}`}
                                            </ReactMarkdown>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                {isCorrect ? 
                                    <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} /> Correct</span> : 
                                    <span style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16} /> {isSkipped ? 'Skipped' : 'Incorrect'}</span>
                                }
                                {q.explanation && (
                                    <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: '#e3f2fd', borderRadius: '8px', color: '#1565c0' }} className="tiptap-content">
                                        <strong>Explanation:</strong> 
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                            {q.explanation}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn-primary" onClick={resetQuiz} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCcw size={20} /> Try Again
              </button>
              <Link href="/dashboard" className="btn-secondary">
                Go to Dashboard
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
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <span className={styles.questionCount}>Question {currentQuestion + 1} of {questions.length}</span>
            <div className={styles.timer}>
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.progressBarContainer}>
            <motion.div 
              className={styles.progressBar}
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${styles.question} tiptap-content`}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {questions[currentQuestion].text}
                </ReactMarkdown>
              </div>
              <div className={styles.optionsGrid}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <span style={{ 
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: selectedOption === index ? 'rgba(255,255,255,0.2)' : '#f1f5f9', 
                        borderRadius: '6px', fontSize: '12px', fontWeight: 800, marginRight: '12px'
                    }}>{optionLetters[index]}</span>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                      {option}
                    </ReactMarkdown>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.quizFooter}>
            <p style={{ fontSize: '0.875rem', color: '#999' }}>* Select an option to proceed</p>
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={selectedOption === null}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={20} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
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
    .tiptap-content { font-family: 'Inter', sans-serif; line-height: 1.6; }
    .tiptap-content p { margin: 0; }
    .tiptap-content .katex-display { margin: 1.5rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px; overflow-x: auto; }
  ` }} />
);
