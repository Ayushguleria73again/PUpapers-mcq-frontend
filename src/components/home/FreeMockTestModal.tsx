'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './FreeMockTestModal.module.css';

interface FreeMockTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FreeMockTestModal = ({ isOpen, onClose }: FreeMockTestModalProps) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStream, setSelectedStream] = useState<'PCB' | 'PCM' | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUserStatus();
        }
    }, [isOpen]);

    const fetchUserStatus = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null); // Not logged in
            }
        } catch (err) {
            console.error('Failed to fetch user status');
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
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Select Your Stream:</label>
                                    <div className={styles.streamGrid}>
                                        <button 
                                            onClick={() => setSelectedStream('PCB')}
                                            className={`${styles.streamBtn} ${selectedStream === 'PCB' ? styles.active : ''}`}
                                        >
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PCB</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Phy, Chem, Bio</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedStream('PCM')}
                                            className={`${styles.streamBtn} ${selectedStream === 'PCM' ? styles.active : ''}`}
                                        >
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PCM</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Phy, Chem, Math</span>
                                        </button>
                                    </div>
                                </div>

                                <Link 
                                    href={selectedStream ? `/pucet-mock?stream=${selectedStream}` : '#'}
                                    style={{ display: 'block', pointerEvents: !selectedStream ? 'none' : 'auto' }}
                                >
                                    <button 
                                        disabled={!selectedStream}
                                        className={`${styles.startBtn} ${selectedStream ? styles.primary : ''}`}
                                    >
                                        Start Mock Test <ArrowRight size={20} />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FreeMockTestModal;
