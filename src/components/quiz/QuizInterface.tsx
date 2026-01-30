'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChevronRight, RefreshCcw, XCircle } from 'lucide-react';
import styles from './QuizInterface.module.css';
import Link from 'next/link';
import DOMPurify from 'dompurify';

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
  const [
    userAnswers,
    setUserAnswers
  ] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  useEffect(() => {
    if (!subjectSlug) {
        setQuestions([]); // Or load mock data as fallback
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
    
    // Assume all questions belong to the same subject, pick the first one's subject ID
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
      // Calculate score based on userAnswers and the current selection (if any)
      // Note: userAnswers array might not have the last answer yet if triggered by timer
      
      let finalAnswers = [...userAnswers];
      if (selectedOption !== null && currentQuestion === finalAnswers.length) {
          finalAnswers.push(selectedOption);
      }
      
      // Fill remaining answers with -1 (unanswered)
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

    // Save answer
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
      // This path is usually triggered by "Finish Quiz" button
      // But we need to update state properly before calling finish
      // For simplicity, we can let the state update locally and then finish
      
      // Calculate score immediately for this flow
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
    return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Quiz...</div>;
  }

  if (questions.length === 0) {
     return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>No questions found for this subject.</div>;
  }

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
            <CheckCircle2 size={64} color="#FF6B00" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className={styles.question}>Quiz Completed!</h2>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNumber}>{score}/{questions.length}</span>
              <span className={styles.scoreLabel}>Final Score</span>
            </div>
            
            <p className={styles.cardDesc}>
              {savingResult ? "Saving your result..." : 
                (score === questions.length ? "Perfect! You're ready for the CET!" : "Good effort! Keep practicing to improve your score.")
              }
            </p>

            <div className={styles.detailedResults} style={{ width: '100%', marginTop: '2rem', textAlign: 'left' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Detailed Analysis</h3>
                {questions.map((q, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === q.correctOption;
                    const isSkipped = userAnswer === -1;

                    return (
                        <div key={q._id} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div 
                                style={{ fontWeight: 600, marginBottom: '0.8rem' }} 
                                className="tiptap-content"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`${index + 1}. ${q.text}`) }}
                            />
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {q.options.map((opt, optIdx) => {
                                    let optionStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #ddd' };
                                    
                                    // Highlight logic
                                    if (optIdx === q.correctOption) {
                                        optionStyle = { ...optionStyle, border: '1px solid #2ecc71', background: '#eafaf1', color: '#2ecc71', fontWeight: 'bold', position: 'relative' };
                                    } else if (optIdx === userAnswer && !isCorrect) {
                                        optionStyle = { ...optionStyle, border: '1px solid #e74c3c', background: '#fdedec', color: '#e74c3c', position: 'relative' };
                                    }

                                    return (
                                        <div 
                                            key={optIdx} 
                                            style={optionStyle} 
                                            className="tiptap-content"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(opt) }}
                                        />
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                {isCorrect ? 
                                    <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} /> Correct</span> : 
                                    <span style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16} /> {isSkipped ? 'Skipped' : 'Incorrect'}</span>
                                }
                                {q.explanation && (
                                    <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: '#e3f2fd', borderRadius: '6px', borderLeft: '3px solid #3498db', color: '#1565c0', fontSize: '0.9rem' }} className="tiptap-content">
                                        <strong>Explanation:</strong> 
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.explanation || '') }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem auto 0' }}>
              <button className="btn-primary" onClick={resetQuiz} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCcw size={20} /> Try Again
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => window.location.href = '/dashboard'} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
              >
                Go to Dashboard
              </button>
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
              <Clock size={20} />
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
              <div 
                className={`${styles.question} tiptap-content`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(questions[currentQuestion].text) }}
              />
              <div className={styles.optionsGrid}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`}
                    onClick={() => handleOptionSelect(index)}
                    style={{ textAlign: 'left' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option) }}
                  />
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
              style={{ opacity: selectedOption === null ? 0.5 : 1 }}
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

// Adding styles for rich text rendering
const EditorStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .tiptap-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
    .tiptap-content ul, .tiptap-content ol { padding-left: 1.5rem; margin: 10px 0; }
    .tiptap-content p { margin: 5px 0; }
    .tiptap-content h1, .tiptap-content h2, .tiptap-content h3 { margin: 15px 0 10px; }
    .tiptap-content blockquote { border-left: 4px solid #ea580c; padding-left: 1rem; font-style: italic; color: #4b5563; }
  ` }} />
);
