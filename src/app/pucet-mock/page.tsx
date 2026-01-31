'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowRight, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import QuizInterface from '@/components/quiz/QuizInterface';
import styles from './PUCETMock.module.css';

const PUCETMockPage = () => {
    const [stream, setStream] = useState<string | null>(null);

    const streams = [
        { 
            id: 'PCB', 
            name: 'Medical (PCB)', 
            description: 'Physics, Chemistry, and Biology',
            icon: <Sparkles color="#FF6B00" />,
            color: '#fdf2f8'
        },
        { 
            id: 'PCM', 
            name: 'Non-Medical (PCM)', 
            description: 'Physics, Chemistry, and Mathematics',
            icon: <Shield color="#FF6B00" />,
            color: '#f0f9ff'
        }
    ];

    if (stream) {
        return (
            <main>
                <QuizInterface stream={stream} />
            </main>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className="container">
                <div className={styles.content}>
                    <motion.div 
                        className={styles.header}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className={styles.badge}>Entrance Exam 2026</span>
                        <h1 className={styles.title}>PUCET <span>Champions</span> Mock Test</h1>
                        <p className={styles.subtitle}>Select your stream to begin a comprehensive exam simulation designed specifically for the Panjab University Common Entrance Test.</p>
                    </motion.div>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureItem}>
                            <Clock size={20} />
                            <span>Timed Sessions</span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircle size={20} />
                            <span>60 High-Yield MCQs</span>
                        </div>
                        <div className={styles.featureItem}>
                            <GraduationCap size={20} />
                            <span>Official Exam Pattern</span>
                        </div>
                    </div>

                    <div className={styles.streamGrid}>
                        {streams.map((s, idx) => (
                            <motion.button
                                key={s.id}
                                className={styles.streamCard}
                                onClick={() => setStream(s.id)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            >
                                <div className={styles.iconBox}>{s.icon}</div>
                                <h3 className={styles.streamName}>{s.name}</h3>
                                <p className={styles.streamDesc}>{s.description}</p>
                                <div className={styles.startBtn}>
                                    Take Exam <ArrowRight size={16} />
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <p className={styles.footerNote}>
                        This exam covers full 11th & 12th syllabus for all three core subjects.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PUCETMockPage;
