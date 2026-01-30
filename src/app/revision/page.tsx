'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bookmark, 
    Trash2, 
    BrainCircuit, 
    ArrowLeft, 
    BookOpen,
    Loader2
} from 'lucide-react';
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

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/bookmarks`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data);
            }
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: id }),
                credentials: 'include'
            });
            if (res.ok) {
                setBookmarks(prev => prev.filter(b => b._id !== id));
            }
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
            `}</style>
        </div>
    );
};

export default RevisionVaultPage;
