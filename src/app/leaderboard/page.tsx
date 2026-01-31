'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

import styles from './Leaderboard.module.css';

import { useContent } from '@/context/ContentContext';

const LeaderboardPage = () => {
    const { subjects } = useContent();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    // Removed local subjects fetch logic
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard('all');
    }, []);

    // Removed fetchSubjects function

    const fetchLeaderboard = async (subjectId: string) => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/content/leaderboard`;
            if (subjectId !== 'all') {
                url += `?subjectId=${subjectId}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
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

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="text-yellow-500" size={24} fill="currentColor" />;
        if (index === 1) return <Medal className="text-gray-400" size={24} fill="currentColor" />; // Silver
        if (index === 2) return <Medal className="text-amber-700" size={24} fill="currentColor" />; // Bronze
        return <span className="font-bold text-gray-500">#{index + 1}</span>;
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            
            <div className={styles.container}>
                <div className={styles.headerSection}>
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className={styles.trophyWrapper}
                    >
                        <Trophy size={48} color="#FF6B00" />
                    </motion.div>
                    <h1 className={styles.title}>Student Leaderboard</h1>
                    <p className={styles.subtitle}>Celebrating achievements and top performers.</p>
                </div>

                <div className={styles.contentWrapper}>
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

                    {/* Leaderboard Table/List */}
                    <div className={styles.rankingsCard}>
                        <div className={`${styles.columnGrid} ${styles.tableHeader}`}>
                            <div>Rank</div>
                            <div>Student</div>
                            <div style={{ textAlign: 'center' }}>Tests</div>
                            <div style={{ textAlign: 'right' }}>Score</div>
                        </div>

                        {loading ? (
                            <div className={styles.emptyState}>
                                Loading rankings...
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className={styles.emptyState}>
                                No results found yet. Be the first to take a test!
                            </div>
                        ) : (
                            leaderboard.map((user, index) => (
                                <motion.div 
                                    key={user._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`${styles.columnGrid} ${styles.tableRow}`}
                                    style={{ background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'white' }}
                                >
                                    <div className={styles.rankCell}>
                                        {getRankIcon(index)}
                                    </div>
                                    
                                    <div className={styles.studentCell}>
                                        <div 
                                            className={styles.avatar}
                                            style={{ background: `hsl(${(index * 137) % 360}, 70%, 80%)` }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={styles.studentName}>
                                            {user.name}
                                            {index === 0 && <span className={styles.championBadge}>CHAMPION</span>}
                                        </div>
                                    </div>

                                    <div className={styles.testsCell}>
                                        {user.testsTaken}
                                    </div>

                                    <div className={styles.scoreCell}>
                                        <div className={styles.totalScore}>
                                            {user.totalScore}
                                        </div>
                                        <div className={styles.avgScore}>
                                            {user.avgPercentage}% Avg
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
