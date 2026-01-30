'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, BrainCircuit, Target, Star, ArrowLeft, Trophy, Lock } from 'lucide-react';
import styles from './ChapterSelector.module.css';
import PremiumModal from '../home/PremiumModal';

interface Chapter {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

interface Subject {
    _id: string;
    name: string;
    slug: string;
    image?: string;
}

interface ChapterSelectorProps {
    subjectSlug: string;
    onSelect: (chapterId: string | null, difficulty: string) => void;
    onBack: () => void;
}

const ChapterSelector = ({ subjectSlug, onSelect, onBack }: ChapterSelectorProps) => {
    const [user, setUser] = useState<any>(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch User
                const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });
                if (userRes.ok) setUser(await userRes.json());

                // 1. Fetch Subject to get ID
                const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/subjects`, {
                    credentials: 'include'
                });
                if (subRes.ok) {
                    const subjects = await subRes.json();
                    const currentSub = subjects.find((s: Subject) => s.slug === subjectSlug);
                    if (currentSub) {
                        setSubject(currentSub);
                        
                        // 2. Fetch Chapters for this subject
                        const chapRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/chapters?subjectId=${currentSub._id}`, {
                            credentials: 'include'
                        });
                        if (chapRes.ok) {
                            const chapData = await chapRes.json();
                            setChapters(chapData);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch chapters:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [subjectSlug]);

    const handleChapterClick = (chapterId: string | null) => {
        const isPremium = user?.isPremium;
        if (!isPremium) {
            setShowPremiumModal(true);
            return;
        }
        onSelect(chapterId, difficulty);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 40, height: 40, border: '3px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1rem' }}
                />
                <p style={{ fontWeight: 600, color: '#0f172a' }}>Loading Chapters...</p>
            </div>
        );
    }

    return (
        <div className={styles.selectorContainer}>
            <button className={styles.backButton} onClick={onBack}>
                <ArrowLeft size={18} /> Back to Subjects
            </button>

            <div className={styles.header}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.headerWrapper}
                >
                    <span className={styles.badge}>Targeted Practice</span>
                    <h1 className={styles.title}>
                        {subject?.name} <span>Chapters</span>
                    </h1>
                    
                    <div className={styles.difficultySection}>
                        <p className={styles.sectionLabel}>Select Difficulty</p>
                        <div className={styles.difficultyPicker}>
                            {difficulties.map((diff) => (
                                <button
                                    key={diff.id}
                                    className={`${styles.diffBtn} ${difficulty === diff.id ? styles.activeDiff : ''}`}
                                    onClick={() => setDifficulty(diff.id)}
                                >
                                    {diff.icon}
                                    {diff.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className={styles.selectionGrid}>
                {/* Mastery Option - Premium Only */}
                <motion.button 
                    className={`${styles.masteryCard} ${!user?.isPremium ? styles.locked : ''}`}
                    whileHover={user?.isPremium ? { scale: 1.01 } : {}}
                    whileTap={user?.isPremium ? { scale: 0.98 } : {}}
                    onClick={() => handleChapterClick(null)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {!user?.isPremium && (
                        <div className={styles.lockOverlay}>
                            <Lock size={32} color="#94a3b8" />
                        </div>
                    )}
                    <div className={styles.masteryContent}>
                        <div className={styles.masteryIcon}>
                            <Star size={24} />
                        </div>
                        <div className={styles.masteryText}>
                            <h3>Full Subject Quiz</h3>
                            <p>Test your knowledge across all chapters</p>
                        </div>
                    </div>
                    {user?.isPremium && <ChevronRight size={20} className={styles.masteryArrow} />}
                </motion.button>

                {/* Chapter Options - Premium Only */}
                {chapters.map((chapter, index) => (
                    <motion.button 
                        key={chapter._id}
                        className={`${styles.chapterCard} ${!user?.isPremium ? styles.locked : ''}`}
                        whileHover={user?.isPremium ? { scale: 1.02 } : {}}
                        whileTap={user?.isPremium ? { scale: 0.98 } : {}}
                        onClick={() => handleChapterClick(chapter._id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                    >
                        {!user?.isPremium && (
                            <div className={styles.lockOverlay}>
                                <Lock size={24} color="#94a3b8" />
                            </div>
                        )}
                        <div className={styles.chapterIcon}>
                            <BookOpen size={20} />
                        </div>
                        <div className={styles.chapterInfo}>
                            <h3>{chapter.name}</h3>
                            <p>{chapter.description || 'Targeted practice for this specific chapter.'}</p>
                        </div>
                    </motion.button>
                ))}

                {chapters.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                        <BrainCircuit size={40} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                        <p>No chapters found for this subject yet.</p>
                        <button 
                            className={styles.masteryCard} 
                            style={{ margin: '2rem auto 0', width: 'auto', display: 'flex' }}
                            onClick={() => handleChapterClick(null)}
                        >
                            Take Full Subject Quiz
                        </button>
                    </div>
                )}
            </div>

            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        </div>
    );
};

export default ChapterSelector;
