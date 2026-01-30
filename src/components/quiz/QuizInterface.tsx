'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle2, ChevronRight, XCircle, 
  Trophy, BookOpen, BrainCircuit, Target, Check, X, BarChart2
} from 'lucide-react';
import styles from './QuizInterface.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  chapterId?: string | null;
}

const QuizInterface = ({ subjectSlug, chapterId }: QuizInterfaceProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); 

  const storageKey = `quiz_state_${subjectSlug}${chapterId ? `_${chapterId}` : ''}`;

  // REMOVED individual useEffect for restoration - moved into unified initialization below

  useEffect(() => {
    if (!loading && questions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({
        questions, currentQuestion, selectedOption, userAnswers, score, showResult, timeLeft
      }));
    }
  }, [currentQuestion, selectedOption, userAnswers, score, showResult, timeLeft, storageKey, loading, questions]);

  useEffect(() => {
    if (!subjectSlug) {
        setQuestions([]); 
        setLoading(false);
        return;
    }

    const initializeQuiz = async () => {
      setLoading(true);
      
      // 1. Check Storage First
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.questions && parsed.questions.length > 0) {
            setQuestions(parsed.questions);
            setCurrentQuestion(parsed.currentQuestion || 0);
            setSelectedOption(parsed.selectedOption ?? null);
            setUserAnswers(parsed.userAnswers || []);
            setScore(parsed.score || 0);
            setShowResult(parsed.showResult || false);
            setTimeLeft(parsed.timeLeft ?? 180);
            setLoading(false);
            return; // Successfully restored, EXIT initialization
          }
        } catch (e) { console.error("Restore failed:", e); }
      }

      // 2. Fallback to API Fetch
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/content/questions?slug=${subjectSlug}`;
        if (chapterId) {
            url += `&chapterId=${chapterId}`;
        }

        const res = await fetch(url, {
            credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          // SHUFFLE ONLY ONCE (First time fetch)
          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setQuestions(shuffled);
          // Reset state for a fresh start
          setCurrentQuestion(0);
          setSelectedOption(null);
          setUserAnswers([]);
          setScore(0);
          setShowResult(false);
          setTimeLeft(180);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };

    initializeQuiz();
  }, [subjectSlug, storageKey]);

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

  const finishQuiz = (finalAnswersArg?: number[]) => {
      let finalAnswers = finalAnswersArg || [...userAnswers];
      if (selectedOption !== null && currentQuestion === finalAnswers.length) {
          finalAnswers = [...finalAnswers, selectedOption];
      }
      while (finalAnswers.length < questions.length) finalAnswers.push(-1);
      setUserAnswers(finalAnswers);
      let finalScore = 0;
      finalAnswers.forEach((answer, index) => { 
          if (Number(answer) === Number(questions[index].correctOption)) finalScore++; 
      });
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
    
    if (currentQuestion < questions.length - 1) {
      setUserAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
        finishQuiz(newAnswers);
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

  const resetAndRedirect = () => {
    localStorage.removeItem(storageKey);
    router.push('/dashboard');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <p style={{ fontWeight: 700, color: '#0f172a' }}>Loading Assessment...</p>
    </div>
  );

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (showResult) {
    const correctCount = score;
    const wrongCount = questions.length - score;
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className={styles.quizContainer}>
        <EditorStyles />
        <div className={styles.quizCard}>
          <div className={styles.results}>
            <div style={{ marginBottom: '2rem' }}>
                <Trophy size={40} color="#0f172a" style={{ margin: '0 auto 1.5rem' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Practice Results</h1>
                <p style={{ color: '#64748b', fontWeight: 500 }}>Summary for {questions[0]?.subject.name}</p>
            </div>

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <BarChart2 size={20} color="#64748b" />
                    <span className={styles.metricValue}>{accuracy}%</span>
                    <span className={styles.metricLabel}>Accuracy</span>
                </div>
                <div className={styles.metricCard}>
                    <Check size={20} color="#10b981" />
                    <span className={styles.metricValue} style={{ color: '#059669' }}>{correctCount}</span>
                    <span className={styles.metricLabel}>Correct</span>
                </div>
                <div className={styles.metricCard}>
                    <X size={20} color="#ef4444" />
                    <span className={styles.metricValue} style={{ color: '#dc2626' }}>{wrongCount}</span>
                    <span className={styles.metricLabel}>Incorrect</span>
                </div>
            </div>
            
            <div className={styles.solutionGuide}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Answer Key & Explanations</h2>
                
                {questions.map((q, index) => {
                    const isCorrect = Number(userAnswers[index]) === Number(q.correctOption);
                    return (
                        <div key={q._id} className={styles.solutionStep}>
                            <div className={styles.stepHeader}>
                                Question {index + 1} • {isCorrect ? <span style={{ color: '#059669' }}>Correct</span> : <span style={{ color: '#dc2626' }}>Incorrect</span>}
                            </div>
                            
                            <div className="tiptap-content" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {cleanMarkdownForRendering(q.text)}
                                </ReactMarkdown>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', marginBottom: '1.5rem' }}>
                                {q.options.map((opt, oIdx) => {
                                    const isCorrectOpt = oIdx === q.correctOption;
                                    const isUserPick = oIdx === userAnswers[index];
                                    return (
                                        <div key={oIdx} style={{ 
                                            padding: '0.75rem 1rem', borderRadius: '8px', 
                                            background: isCorrectOpt ? '#f0fdf4' : isUserPick ? '#fef2f2' : '#ffffff',
                                            border: `1px solid ${isCorrectOpt ? '#10b981' : isUserPick ? '#ef4444' : '#e2e8f0'}`,
                                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px'
                                        }}>
                                            <span style={{ fontWeight: 700, opacity: 0.5 }}>{optionLetters[oIdx]}.</span>
                                            <div style={{ flex: 1 }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                    {cleanMarkdownForRendering(opt)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {q.explanation && (
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                        <BrainCircuit size={14} /> Explanation
                                    </div>
                                    <div className="tiptap-content" style={{ fontSize: '0.95rem' }}>
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
              <button className="btn-primary" onClick={resetQuiz} style={{ padding: '0.75rem 2rem', borderRadius: '8px' }}>Start New Practice</button>
              <button onClick={resetAndRedirect} className="btn-secondary" style={{ padding: '0.75rem 2rem', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#020617' }}>View Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer}>
      <EditorStyles />
      <div className="container">
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <span className={styles.questionCount}>Question {currentQuestion + 1}/{questions.length}</span>
            <div className={styles.timer}>
              <Clock size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <div className={`${styles.question} tiptap-content`}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {cleanMarkdownForRendering(questions[currentQuestion].text)}
                </ReactMarkdown>
              </div>
              
              <div className={styles.optionsGrid}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button key={index} className={`${styles.option} ${selectedOption === index ? styles.selectedOption : ''} tiptap-content`} onClick={() => setSelectedOption(index)}>
                    <span style={{ 
                        width: '24px', height: '24px', background: selectedOption === index ? 'rgba(255,255,255,0.2)' : '#f1f5f9', 
                        borderRadius: '6px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{optionLetters[index]}</span>
                    <div style={{ flex: 1 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                            {cleanMarkdownForRendering(option)}
                        </ReactMarkdown>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.quizFooter}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Select an option to continue</p>
            <button className="btn-primary" onClick={handleNext} disabled={selectedOption === null} style={{ padding: '0.6rem 2rem', borderRadius: '8px', fontWeight: 700 }}>
              {currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next Question'} <ChevronRight size={16} />
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
    .tiptap-content { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; }
    .tiptap-content p { margin: 0; }
    .tiptap-content .katex-display { 
        margin: 1.5rem 0; 
        padding: 1.5rem; 
        background: #f8fafc; 
        border-radius: 12px; 
        border: 1px solid #e2e8f0;
        overflow-x: auto;
    }
    .tiptap-content .katex { font-size: 1.15em; color: #020617; }
    
    .btn-primary { 
        background: #020617; 
        color: white; 
        border: none; 
        cursor: pointer;
        transition: opacity 0.2s ease;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

    .btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: #020617;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
    }
    .btn-secondary:hover {
        background: #f8fafc;
        border-color: #94a3b8;
    }
  ` }} />
);
