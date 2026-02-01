'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, BookOpen, Target, Trophy, School, User as UserIcon, Star, Shield } from 'lucide-react';
import Image from 'next/image';
import styles from './UserProfileModal.module.css';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        fullName?: string;
        profileImage?: string;
        bio?: string;
        institution?: string;
        totalScore: number;
        testsTaken: number;
        avgPercentage: number;
    } | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    const getBadges = (userData: any) => {
        const badges = [];
        if (userData.avgPercentage >= 90) badges.push({ icon: Target, color: '#ef4444', label: 'Sharpshooter' });
        if (userData.testsTaken >= 10) badges.push({ icon: Shield, color: '#3b82f6', label: 'Veteran' });
        if (userData.totalScore >= 1000) badges.push({ icon: Star, color: '#eab308', label: 'Legend' });
        return badges;
    };

    const badges = getBadges(user);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay}>
                    <motion.div 
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div 
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>

                        <div className={styles.content}>
                            <div className={styles.header}>
                                <div className={styles.avatarWrapper}>
                                    {user.profileImage ? (
                                        <Image 
                                            src={user.profileImage} 
                                            alt={user.fullName || user.name} 
                                            width={120} 
                                            height={120} 
                                            className={styles.avatar} 
                                        />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {(user.fullName || user.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h2 className={styles.userName}>{user.fullName || user.name}</h2>
                                {user.institution && (
                                    <div className={styles.institution}>
                                        <School size={16} /> {user.institution}
                                    </div>
                                )}
                            </div>

                            {badges.length > 0 && (
                                <div className={styles.badgeSection}>
                                    {badges.map((badge, idx) => (
                                        <div key={idx} className={styles.badge} title={badge.label} style={{ color: badge.color, background: `${badge.color}15` }}>
                                            <badge.icon size={16} fill={badge.color} />
                                            <span>{badge.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.statsGrid}>
                                <div className={styles.statBox}>
                                    <div className={styles.statIcon} style={{ background: '#FF6B0010', color: '#FF6B00' }}>
                                        <Trophy size={20} />
                                    </div>
                                    <div className={styles.statLabel}>Total Points</div>
                                    <div className={styles.statValue}>{user.totalScore}</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statIcon} style={{ background: '#3b82f610', color: '#3b82f6' }}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className={styles.statLabel}>Tests Taken</div>
                                    <div className={styles.statValue}>{user.testsTaken}</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statIcon} style={{ background: '#10b98110', color: '#10b981' }}>
                                        <Target size={20} />
                                    </div>
                                    <div className={styles.statLabel}>Avg. Accuracy</div>
                                    <div className={styles.statValue}>{user.avgPercentage}%</div>
                                </div>
                            </div>

                            {user.bio && (
                                <div className={styles.bioSection}>
                                    <h3>About</h3>
                                    <p>{user.bio}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileModal;
