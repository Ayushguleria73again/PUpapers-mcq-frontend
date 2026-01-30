'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, BrainCircuit, Target, Star } from 'lucide-react';
import styles from './ChapterSelector.module.css';

interface Chapter {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

interface Subject {
    _id: string;
    name: string;
}

interface ChapterSelectorProps {
    subjectSlug: string;
    onSelect: (chapterId: string | null) => void;
}

const ChapterSelector = ({ subjectSlug, onSelect }: ChapterSelectorProps) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. Fetch Subject to get ID
                const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/subjects`, {
                    credentials: 'include'
                });
                if (subRes.ok) {
                    const subjects = await subRes.json();
                    const currentSub = subjects.find((s: any) => s.slug === subjectSlug);
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
            <div className={styles.header}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1>{subject?.name}</h1>
                    <p>Choose a specific chapter to practice or take the full subject challenge.</p>
                </motion.div>
            </div>

            <div className={styles.selectionGrid}>
                {/* Mastery Option */}
                <motion.button 
                    className={styles.masteryCard}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(null)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.masteryContent}>
                        <Star size={24} color="white" fill="white" style={{ marginBottom: '0.75rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Full Subject Quiz</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>Complete exam covering all available chapters.</p>
                    </div>
                </motion.button>

                {/* Chapter Options */}
                {chapters.map((chapter, index) => (
                    <motion.button 
                        key={chapter._id}
                        className={styles.chapterCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(chapter._id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                    >
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
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>
                        <BrainCircuit size={40} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                        <p>No chapters found for this subject yet.</p>
                        <button 
                            className={styles.masteryCard} 
                            style={{ margin: '2rem auto 0', width: 'auto', display: 'flex' }}
                            onClick={() => onSelect(null)}
                        >
                            Take Full Subject Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterSelector;
