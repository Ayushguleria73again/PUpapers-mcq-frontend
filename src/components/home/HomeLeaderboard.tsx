'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';
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
                        
                        let rank = index + 1;
                        let rankStyle = styles.card;
                        let icon = null;

                        // Logic for "podium" ordering
                        if (topStudents.length === 3) {
                             if (index === 0) { rank = 2; rankStyle = `${styles.card} ${styles.silver}`; icon = <Medal size={24} color="#C0C0C0" fill="#C0C0C0" />; }
                             else if (index === 1) { rank = 1; rankStyle = `${styles.card} ${styles.gold}`; icon = <Crown size={28} color="#FFD700" fill="#FFD700" />; }
                             else if (index === 2) { rank = 3; rankStyle = `${styles.card} ${styles.bronze}`; icon = <Medal size={24} color="#CD7F32" fill="#CD7F32" />; }
                        } else {
                            // Basic linear fallback if < 3 students
                             if (index === 0) { rank = 1; rankStyle = `${styles.card} ${styles.gold}`; icon = <Crown size={28} color="#FFD700" fill="#FFD700" />; }
                             else if (index === 1) { rank = 2; rankStyle = `${styles.card} ${styles.silver}`; icon = <Medal size={24} color="#C0C0C0" fill="#C0C0C0" />; }
                             else if (index === 2) { rank = 3; rankStyle = `${styles.card} ${styles.bronze}`; icon = <Medal size={24} color="#CD7F32" fill="#CD7F32" />; }
                        }

                        return (
                            <motion.div 
                                key={student._id}
                                className={rankStyle}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className={styles.rankBadge}>
                                    {icon}
                                </div>
                                <div 
                                    className={styles.avatar}
                                    style={{ background: `hsl(${(rank * 137) % 360}, 70%, 80%)` }}
                                >
                                    {(student.fullName || student.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <h3 className={styles.name}>{student.fullName || student.name}</h3>
                                <div className={styles.score}>{student.totalScore}</div>
                                <div className={styles.details}>
                                    {student.testsTaken} Tests Taken • {student.avgPercentage}% Avg
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
