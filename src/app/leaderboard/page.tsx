'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { motion } from 'framer-motion';
import { Crown, Star, Target, Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import NextImage from 'next/image';
import styles from './Leaderboard.module.css';
import { useContent } from '@/context/ContentContext';
import UserProfileModal from '@/components/shared/UserProfileModal';

interface LeaderboardEntry {
    _id: string;
    fullName?: string;
    name?: string;
    totalScore: number;
    testsTaken: number;
    avgPercentage: number;
    profileImage?: string;
    bio?: string;
    institution?: string;
}

const LeaderboardPage = () => {
    const { subjects } = useContent();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [loading, setLoading] = useState(true);
    
    // Profile Modal State
    const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLeaderboard('all');
    }, []);

    const fetchLeaderboard = async (subjectId: string) => {
        setLoading(true);
        try {
            let endpoint = '/content/leaderboard';
            if (subjectId !== 'all') {
                endpoint += `?subjectId=${subjectId}`;
            }
            const data = await apiFetch<LeaderboardEntry[]>(endpoint);
            setLeaderboard(data);
        } catch (err) {
            console.error('Failed to fetch leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subjectId = e.target.value;
        setSelectedSubject(subjectId);
        fetchLeaderboard(subjectId);
    };

    const handleUserClick = (user: LeaderboardEntry) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Separate Top 3 from the rest
    const topThree = leaderboard.slice(0, 3);
    const restOfList = leaderboard.slice(3);

    // Helper to get Podium Data safely
    const getPodiumData = (index: number) => {
        if (index >= topThree.length) return null;
        return topThree[index];
    };

    // Badge Logic Helper
    const getBadges = (user: LeaderboardEntry) => {
        const badges = [];
        if (user.avgPercentage >= 90) badges.push({ icon: Target, color: '#ef4444', title: 'Sharpshooter (>90% Acc)' });
        if (user.testsTaken >= 10) badges.push({ icon: Shield, color: '#3b82f6', title: 'Veteran (>10 Tests)' });
        if (user.totalScore >= 1000) badges.push({ icon: Star, color: '#eab308', title: 'Legend (>1000 pts)' });
        return badges;
    };

    const renderPodiumPlace = (place: number, data: LeaderboardEntry | null) => {
        if (!data) return null;
        
        let placeClass = '';
        let delay = 0;

        if (place === 1) { 
            placeClass = styles.firstPlace; 
            delay = 0.4; 
        } else if (place === 2) { 
            placeClass = styles.secondPlace; 
            delay = 0.2;
        } else if (place === 3) { 
            placeClass = styles.thirdPlace; 
            delay = 0.3;
        }

        return (
            <motion.div 
                className={`${styles.podiumPlace} ${placeClass}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay, type: 'spring', stiffness: 100 }}
                onClick={() => handleUserClick(data)}
                style={{ cursor: 'pointer' }}
            >
                {place === 1 && (
                    <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: -10 }}
                        transition={{ delay: 0.6 }}
                        className={styles.crownIcon}
                    >
                        <Crown size={40} fill="#FFD700" color="#B8860B" />
                    </motion.div>
                )}
                
                <div className={styles.podiumAvatarContainer}>
                    <div className={styles.podiumAvatar}>
                        {data.profileImage ? (
                            <NextImage 
                                src={data.profileImage} 
                                alt="User" 
                                width={80} 
                                height={80} 
                                style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                        ) : (
                            (data.fullName || data.name || '?').charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                <div className={styles.podiumBase}>
                    <div className={styles.podiumName}>{data.fullName || data.name}</div>
                    <div className={styles.podiumScore}>{data.totalScore} Points</div>
                    <div className={styles.rankNumber}>{place}</div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            
            <div className={styles.container}>
                <div className={styles.headerSection}>
                    <h1 className={styles.title}>Hall of Fame</h1>
                    <p className={styles.subtitle}>Celebrating our top achievers and dedicated learners.</p>
                </div>

                {/* Filters */}
                <div className={styles.filterContainer}>
                    <select 
                        value={selectedSubject}
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Subjects</option>
                        {subjects.map(sub => (
                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>
                        Loading rankings...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className={styles.emptyState}>
                        No champions yet. Be the first to take a test!
                        <div style={{ marginTop: '1rem' }}>
                            <Star size={48} color="#ddd" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* PODIUM SECTION */}
                        <div className={styles.podiumContainer}>
                            {renderPodiumPlace(2, getPodiumData(1))}
                            {renderPodiumPlace(1, getPodiumData(0))}
                            {renderPodiumPlace(3, getPodiumData(2))}
                        </div>

                        {/* LIST SECTION */}
                        <div className={styles.listContainer}>
                            {restOfList.map((user, index) => (
                                <motion.div 
                                    key={user._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (index * 0.05) }}
                                    className={styles.rankCard}
                                    onClick={() => handleUserClick(user)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.rankPosition}>#{index + 4}</div>
                                    
                                    <div className={styles.studentInfo}>
                                        <div className={styles.listAvatar} style={{ background: `hsl(${(index * 50) % 360}, 70%, 90%)` }}>
                                            {user.profileImage ? (
                                                <NextImage 
                                                    src={user.profileImage} 
                                                    width={40} height={40} 
                                                    alt="Avatar" 
                                                    style={{ borderRadius: '50%' }}
                                                />
                                            ) : (
                                                (user.fullName || user.name || '?').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className={styles.studentName}>
                                            {user.fullName || user.name}
                                            <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>
                                                {getBadges(user).map((badge, i) => (
                                                    <span key={i} title={badge.title}>
                                                       <badge.icon size={14} fill={badge.color} color={badge.color} />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`${styles.statsCell} ${styles.testsHiddenMobile}`}>
                                        <div className={styles.scoreValue}>{user.testsTaken}</div>
                                        <div className={styles.scoreLabel}>Tests</div>
                                    </div>

                                    <div className={`${styles.statsCell} ${styles.testsHiddenMobile}`}>
                                        <div className={styles.scoreValue}>{user.avgPercentage}%</div>
                                        <div className={styles.scoreLabel}>Avg. Acc.</div>
                                    </div>

                                    <div className={styles.statsCell} style={{ textAlign: 'right' }}>
                                        <div className={styles.scoreValue}>{user.totalScore}</div>
                                        <div className={styles.scoreLabel}>Points</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Profile Modal */}
            <UserProfileModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser ? {
                    ...selectedUser,
                    name: selectedUser.name || selectedUser.fullName || 'Anonymous'
                } : null}
            />
        </div>
    );
};

export default LeaderboardPage;
