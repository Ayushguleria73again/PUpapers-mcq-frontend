'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './FreeMockTestModal.module.css';

interface FreeMockTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface User {
    _id: string;
    fullName: string;
    email: string;
    isPremium: boolean;
    freeTestsTaken?: number;
}

const FreeMockTestModal = ({ isOpen, onClose }: FreeMockTestModalProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUserStatus();
        }
    }, [isOpen]);

    const fetchUserStatus = async () => {
        try {
            const data = await apiFetch<User>('/auth/me');
            setUser(data);
        } catch (err) {
            console.error('Failed to fetch user status');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const remainingTests = user ? 5 - (user.freeTestsTaken || 0) : 5;
    const isLimitReached = remainingTests <= 0 && !user?.isPremium;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose}
                        className={styles.closeBtn}
                    >
                        <X size={20} color="#64748b" />
                    </button>

                    <div className={styles.content}>
                        <div className={styles.header}>
                            <span className={styles.iconBadge}>
                                <BookOpen size={32} />
                            </span>
                            <h2 className={styles.title}>Free Mock Test</h2>
                            <p className={styles.subtitle}>Experience the real PUCET exam environment.</p>
                        </div>

                        {!user ? (
                            <div className={styles.loginPrompt}>
                                <Lock size={48} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                                <h3 className={styles.title} style={{ fontSize: '1.1rem' }}>Login Required</h3>
                                <p className={styles.subtitle} style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>You need to log in to track your free attempts.</p>
                                <Link href="/login">
                                    <button className="btn-primary" style={{ width: '100%' }}>Log In to Continue</button>
                                </Link>
                            </div>
                        ) : loading ? (
                            <div className={styles.loadingSpinner}></div>
                        ) : isLimitReached ? (
                            <div className={styles.limitReached}>
                                <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 0.75rem' }} />
                                <h3 className={styles.title} style={{ fontSize: '1.1rem' }}>Free Limit Reached</h3>
                                <p className={styles.subtitle} style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    You have used all 5 free mock tests. Upgrade to Premium for unlimited access.
                                </p>
                                <button className="btn-secondary" style={{ width: '100%', background: '#0f172a', color: 'white', borderColor: '#0f172a' }}>
                                    Upgrade to Premium
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.statsRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={18} />
                                        <span style={{ fontWeight: 500 }}>Free Attempts Remaining</span>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{remainingTests}/5</span>
                                </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '1rem' }}>Select Subject for Free Mock Test:</label>
                                <div className={styles.streamGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                    {[
                                        { id: 'physics', label: 'Physics', sub: 'Class 11 & 12', slug: 'physics-11th-12th', color: '#3b82f6' },
                                        { id: 'chemistry', label: 'Chemistry', sub: 'Complete Syllabus', slug: 'chemistry', color: '#10b981' },
                                        { id: 'maths', label: 'Mathematics', sub: 'PUCET Standard', slug: 'mathematics', color: '#f59e0b' },
                                        { id: 'biology', label: 'Biology', sub: 'Zoology & Botany', slug: 'biology', color: '#ec4899' },
                                    ].map((sub) => (
                                        <button 
                                            key={sub.id}
                                            onClick={() => setSelectedSubject(sub.slug)}
                                            className={`${styles.streamBtn} ${selectedSubject === sub.slug ? styles.active : ''}`}
                                            style={selectedSubject === sub.slug ? { borderColor: sub.color, backgroundColor: `${sub.color}10` } : {}}
                                        >
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: selectedSubject === sub.slug ? sub.color : 'inherit' }}>{sub.label}</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{sub.sub}</span>
                                        </button>
                                    ))}
                                </div>

                                <Link 
                                    href={selectedSubject ? `/mock-tests/${selectedSubject}` : '#'}
                                    style={{ display: 'block', pointerEvents: !selectedSubject ? 'none' : 'auto' }}
                                >
                                    <button 
                                        disabled={!selectedSubject}
                                        className={`${styles.startBtn} ${selectedSubject ? styles.primary : ''}`}
                                    >
                                        Start Mock Test <ArrowRight size={20} />
                                    </button>
                                </Link>
                            </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FreeMockTestModal;
