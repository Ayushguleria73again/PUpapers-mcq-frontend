'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowRight } from 'lucide-react';
import styles from './HomeLeaderboard.module.css';

interface LeaderboardStudent {
    _id: string;
    fullName?: string;
    name?: string;
    totalScore: number;
    testsTaken: number;
    avgPercentage: number;
    profileImage?: string;
}

const HomeLeaderboard = () => {
    const [topStudents, setTopStudents] = useState<LeaderboardStudent[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await apiFetch<LeaderboardStudent[]>('/content/leaderboard');
                setTopStudents(data.slice(0, 3));
            } catch (err) {
                console.error('Failed to fetch leaderboard');
            }
        };
        fetchLeaderboard();
    }, []);

    if (topStudents.length === 0) return null;

    // Helper to order them nicely for desktop: 2nd, 1st, 3rd
    const orderedStudents = topStudents.length === 3 
        ? [topStudents[1], topStudents[0], topStudents[2]]
        : topStudents;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className={styles.title}>Top Performers</h2>
                    <p className={styles.subtitle}>
                        Recognizing the dedication and excellence of our top achievers.
                        Will you be next on the podium?
                    </p>
                </motion.div>

                <div className={styles.grid}>
                    {orderedStudents.map((student, index) => {
                        // We need to map the re-ordered index back to actual rank
                        // If 3 students: index 0 is rank 2 (silver), index 1 is rank 1 (gold), index 2 is rank 3 (bronze)
                        
                        // Rank Logic
                        let rank = index + 1;
                        let rankStyle = styles.card;
                        let icon = null;

                        // Desktop: 2nd (0), 1st (1), 3rd (2)
                        // Mobile: 1st, 2nd, 3rd (Handled via CSS order)
                        
                        // We map the array index to specific styles
                        if (index === 0) { // Render order 1: Actually Rank 2 (Silver)
                            rank = 2; 
                            rankStyle = `${styles.card} ${styles.silver}`; 
                            icon = <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#757575' }}>2</span>; 
                        }
                        else if (index === 1) { // Render order 2: Actually Rank 1 (Gold)
                            rank = 1; 
                            rankStyle = `${styles.card} ${styles.gold}`; 
                            icon = <Crown size={28} color="white" fill="white" />; 
                        }
                        else if (index === 2) { // Render order 3: Actually Rank 3 (Bronze)
                            rank = 3; 
                            rankStyle = `${styles.card} ${styles.bronze}`; 
                            icon = <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#A0552D' }}>3</span>; 
                        }

                        // Fallback for linear list if logic changes
                        if (topStudents.length < 3) {
                             if (index === 0) rankStyle = `${styles.card} ${styles.gold}`;
                        }

                        return (
                            <motion.div 
                                key={student._id}
                                className={rankStyle}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: rank === 1 ? 1.05 : 1 }}
                                viewport={{ once: true }}
                                transition={{ 
                                    duration: 0.6, 
                                    delay: index * 0.15,
                                    type: "spring",
                                    stiffness: 100 
                                }}
                            >
                                <div className={styles.rankBadge}>
                                    {icon}
                                </div>
                                <div className={styles.avatar}>
                                    {student.profileImage ? (
                                        <NextImage 
                                            src={student.profileImage} 
                                            alt="User" 
                                            width={88} 
                                            height={88} 
                                            style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        (student.fullName || student.name || '?').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <h3 className={styles.name}>{student.fullName || student.name}</h3>
                                <div className={styles.score}>{student.totalScore} pts</div>
                                <div className={styles.details}>
                                    {student.testsTaken} Tests • {student.avgPercentage}% Avg
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <Link href="/leaderboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    View Full Leaderboard <ArrowRight size={18} />
                </Link>
            </div>
        </section>
    );
};

export default HomeLeaderboard;
