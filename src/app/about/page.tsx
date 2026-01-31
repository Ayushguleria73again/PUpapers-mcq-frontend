'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Target, 
    Rocket, 
    Shield, 
    Cpu, 
    Zap, 
    TrendingUp, 
    ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import styles from './About.module.css';

const AboutPage = () => {
    const values = [
        {
            icon: <Target size={32} />,
            title: "Precision Preparations",
            description: "We focus on providing question sets that exactly mimic the difficulty and pattern of the official PU CET exam."
        },
        {
            icon: <Zap size={32} />,
            title: "Real-time Feedback",
            description: "No more waiting for results. Get instant accuracy breakdowns and performance insights as soon as you submit."
        },
        {
            icon: <Rocket size={32} />,
            title: "Accelerated Learning",
            description: "Our adaptive difficulty and subject tracking help you spend time where it matters most, boosting your scores faster."
        }
    ];

    const milestones = [
        {
            icon: <Cpu size={24} />,
            title: "Smart Sanitization",
            description: "Every question is normalized with LaTeX for perfect clarity in Mathematics and Science."
        },
        {
            icon: <Shield size={24} />,
            title: "Verified Content",
            description: "Expert-reviewed explanations to ensure you're learning the right concepts the right way."
        },
        {
            icon: <TrendingUp size={24} />,
            title: "Growth Tracking",
            description: "A comprehensive dashboard that maps your mastery over days, weeks, and months."
        }
    ];

    return (
        <div className={styles.aboutPage}>
            
            <header className={styles.hero}>
                <div className={styles.container}>
                    <motion.span 
                        className={styles.badge}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        OUR MISSION
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Redefining the <span>Future</span> of Entrance Prep
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        PuCET MCQ is built with a singular focus: to empower students with technology-driven practice tools that bridge the gap between hard work and success at Panjab University.
                    </motion.p>
                </div>
            </header>

            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>The Pillars of Our Platform</h2>
                        <p>We combine premium design with rigorous academic standards.</p>
                    </div>
                    
                    <div className={styles.grid}>
                        {values.map((v, i) => (
                            <motion.div 
                                key={i}
                                className={styles.card}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={styles.iconWrapper}>
                                    {v.icon}
                                </div>
                                <h3>{v.title}</h3>
                                <p>{v.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.featureSection}>
                <div className={styles.container}>
                    <div className={styles.featureWrapper}>
                        <motion.div 
                            className={styles.featureImage}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <Cpu size={120} color="#FF6B00" />
                        </motion.div>

                        <div className={styles.featureContent}>
                            <h2>Engineered for Excellence</h2>
                            <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', color: '#666' }}>
                                Behind our minimalist interface lies a complex engine designed to handle thousands of concurrent users while maintaining lightning-fast performance.
                            </p>
                            
                            <div className={styles.featureList}>
                                {milestones.map((m, i) => (
                                    <motion.div 
                                        key={i} 
                                        className={styles.featureItem}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div style={{ marginTop: '4px', color: '#FF6B00' }}>
                                            {m.icon}
                                        </div>
                                        <div>
                                            <h4>{m.title}</h4>
                                            <p>{m.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.cta}>
                <div className={styles.container}>
                    <motion.div 
                        className={styles.ctaBox}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Start Your Journey Today</h2>
                        <p>Join thousands of aspirants preparing for a brighter future at PU Chandigarh.</p>
                        <Link href="/signup" className={styles.btnPrimary}>
                            Create Free Account <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>


        </div>
    );
};

export default AboutPage;
