'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, LineChart, Target, ShieldCheck, Zap, Users } from 'lucide-react';
import styles from './SubjectGrid.module.css'; // Reusing grid styles for consistency

const FeaturesSection = () => {
    const features = [
        {
            icon: <Brain size={32} />,
            title: "AI-Powered Explanations",
            description: "Don't just get the answer, understand the 'Why'. Gemini AI explains every solution instantly.",
            color: "#8B5CF6"
        },
        {
            icon: <LineChart size={32} />,
            title: "Performance Analytics",
            description: "Track your progress with detailed charts. Identify weak areas and improve efficiently.",
            color: "#10B981"
        },
        {
            icon: <ShieldCheck size={32} />,
            title: "5000+ Question Bank",
            description: "Practice with a massive repository of high-yield MCQs curated by experts.",
            color: "#F59E0B"
        },
        {
            icon: <Target size={32} />,
            title: "Exam Simulation",
            description: "Experience the real exam pressure with timed tests and official marking schemes.",
            color: "#EF4444"
        },
        {
            icon: <Zap size={32} />,
            title: "Instant Results",
            description: "Get immediate feedback and rankings after every mock test submission.",
            color: "#3B82F6"
        },
        {
            icon: <Users size={32} />,
            title: "Community Leaderboards",
            description: "Compete with peers and see where you stand among thousands of aspirants.",
            color: "#EC4899"
        }
    ];

    return (
        <section className={styles.section} style={{ background: '#ffffff', paddingTop: '50px' }}>
            <div className="container">
                <div className={styles.header}>
                    <h2>Why Choose <span>PUPapers</span>?</h2>
                    <p>Designed to give you the winning edge in your entrance preparation.</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            className={styles.card}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{ 
                                background: '#f8fafc',
                                border: 'none',
                                textAlign: 'left'
                            }}
                        >
                            <div className={styles.iconWrapper} style={{ 
                                background: `${feature.color}15`, 
                                color: feature.color,
                                width: '50px',
                                height: '50px',
                                marginBottom: '1rem'
                            }}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.cardTitle} style={{ fontSize: '1.25rem' }}>{feature.title}</h3>
                            <p className={styles.cardDesc} style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
