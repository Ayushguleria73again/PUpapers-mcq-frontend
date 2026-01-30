'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, ArrowRight } from 'lucide-react';
import styles from './FreeMockTestModal.module.css'; // Reusing existing modal styles for consistency

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
    if (!isOpen) return null;

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
                            <span className={styles.iconBadge} style={{ background: '#fef3c7', color: '#d97706' }}>
                                <Crown size={32} />
                            </span>
                            <h2 className={styles.title}>Premium Content</h2>
                            <p className={styles.subtitle}>Unlock unrestricted access to all chapters and quizzes.</p>
                        </div>

                        <div className={styles.statsRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Check size={18} />
                                <span>Unlimited Chapter-wise Tests</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Check size={18} />
                                <span>Specific Subject Mastery Quizzes</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Check size={18} />
                                <span>Detailed Performance Analytics</span>
                            </div>
                        </div>

                        <button 
                            className={styles.startBtn}
                            style={{ 
                                background: 'linear-gradient(to right, #d97706, #b45309)',
                                color: 'white',
                                marginTop: '1rem'
                            }}
                        >
                            Upgrade Now <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PremiumModal;
