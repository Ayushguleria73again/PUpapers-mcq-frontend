'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bookmark, 
    Trash2, 
    BrainCircuit, 
    ArrowLeft, 
    BookOpen,
    Loader2,
    Sparkles
} from 'lucide-react';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { cleanMarkdownForRendering } from '@/utils/markdownCleaner';
import 'katex/dist/katex.min.css';
import styles from './Revision.module.css';

interface Question {
    _id: string;
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string;
    subject: {
        name: string;
        slug: string;
    };
}

const RevisionVaultPage = () => {
    const [bookmarks, setBookmarks] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [aiExplanations, setAiExplanations] = useState<Record<string, { content: string; loading: boolean }>>({});

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const getAIExplanation = async (id: string) => {
        if (aiExplanations[id]?.loading) return;
    
        setAiExplanations(prev => ({
            ...prev,
            [id]: { content: '', loading: true }
        }));
    
        try {
            // We pass -1 or neutral choice since this is revision
            const data = await apiFetch<any>('/content/explain', {
                method: 'POST',
                body: JSON.stringify({ questionId: id, userChoice: -1 }), 
            });
    
            const cleanContent = data.explanation
                .replace(/[“”]/g, '"')
                .replace(/[‘’]/g, "'");
            setAiExplanations(prev => ({
                ...prev,
                [id]: { content: cleanContent, loading: false }
            }));
        } catch (err: any) {
            setAiExplanations(prev => ({
                ...prev,
                [id]: { content: "Could not connect to AI Tutor. Please try again.", loading: false }
            }));
        }
    };

    const fetchBookmarks = async () => {
        try {
            const data = await apiFetch<Question[]>('/auth/bookmarks');
            setBookmarks(data);
        } catch (err) {
            console.error("Failed to fetch bookmarks:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (id: string) => {
        if (toggling) return;
        setToggling(id);
        try {
            await apiFetch('/auth/bookmarks', {
                method: 'POST',
                body: JSON.stringify({ questionId: id }),
            });
            setBookmarks(prev => prev.filter(b => b._id !== id));
        } catch (err) {
            console.error("Failed to remove bookmark:", err);
        } finally {
            setToggling(null);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            <p style={{ marginTop: '1rem', fontWeight: 700, color: '#0f172a' }}>Syncing Vault...</p>
        </div>
    );

    return (
        <div className={styles.vaultPage}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', fontWeight: 600, textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1>Revision Vault</h1>
                    <p>Your personal collection of challenging questions. Review them anytime to master the core concepts.</p>
                </div>
            </header>

            <main className={styles.container}>
                {bookmarks.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Bookmark size={60} color="#e2e8f0" strokeWidth={1} style={{ margin: '0 auto' }} />
                        <h2>Your vault is empty</h2>
                        <p>Bookmark questions during practice tests to see them here.</p>
                        <Link href="/mock-tests" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '12px' }}>
                            Start a Practice Test <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {bookmarks.map((q, i) => (
                            <motion.div 
                                key={q._id}
                                className={styles.questionCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.subjectBadge}>{q.subject.name}</span>
                                    <button 
                                        className={styles.removeBtn}
                                        onClick={() => removeBookmark(q._id)}
                                        disabled={toggling === q._id}
                                    >
                                        {toggling === q._id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                    </button>
                                </div>

                                <div className={`${styles.questionText} tiptap-content`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                        {cleanMarkdownForRendering(q.text)}
                                    </ReactMarkdown>
                                </div>

                                <div className={styles.optionsList}>
                                    {q.options.map((opt, oIdx) => (
                                        <div 
                                            key={oIdx} 
                                            className={`${styles.optionItem} ${oIdx === q.correctOption ? styles.correctOption : ''}`}
                                        >
                                            <div className="tiptap-content">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                    {cleanMarkdownForRendering(opt)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {q.explanation && (
                                    <div className={styles.explanation}>
                                        <div className={styles.explanationHeader}>
                                            <BrainCircuit size={16} /> Solution Explanation
                                        </div>
                                        <div className="tiptap-content" style={{ fontSize: '0.95rem' }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                {cleanMarkdownForRendering(q.explanation)}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                <div className="ai-section">
                                    {!aiExplanations[q._id] ? (
                                        <button 
                                            className="ai-btn"
                                            onClick={() => getAIExplanation(q._id)}
                                        >
                                            <Sparkles size={16} /> Explain with AI
                                        </button>
                                    ) : (
                                        <div className="ai-box">
                                            <div className="ai-badge">
                                                <Sparkles size={12} /> AI TUTOR
                                            </div>
                                            {aiExplanations[q._id].loading ? (
                                                <div className="ai-loading">
                                                    <Loader2 className="animate-spin" size={16} /> Thinking...
                                                </div>
                                            ) : (
                                                <div className="tiptap-content" style={{ fontSize: '0.95rem', color: '#334155' }}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                                        {aiExplanations[q._id].content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
            <style jsx global>{`
                .tiptap-content p { margin: 0; }
                .btn-primary { 
                    background: var(--primary); 
                    color: white; 
                    border: none; 
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-primary:hover { 
                    background: var(--primary-hover); 
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
                }
                .ai-section { margin-top: 1.5rem; border-top: 1px dashed #e2e8f0; padding-top: 1rem; }
                .ai-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border: 1px solid #bae6fd;
                    color: #0284c7;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ai-btn:hover { background: #e0f2fe; transform: translateY(-1px); }
                .ai-box {
                    margin-top: 1rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.25rem;
                }
                .ai-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #0f172a;
                    color: #f8fafc;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.8rem;
                }
                .ai-loading { font-size: 0.9rem; color: #64748b; font-style: italic; display: flex; align-items: center; gap: 8px; }
            `}</style>
        </div>
    );
};

export default RevisionVaultPage;
