'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './Hero.module.css'; // Reusing button styles

const CountdownSection = () => {
    // Target date: 15th May 2026 (Tentative)
    const targetDate = new Date('2026-05-15T09:00:00').getTime();
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        // Initial set
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    const TimeBlock = ({ value, label }: { value: number, label: string }) => (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '16px',
            minWidth: '100px',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>
                {String(value).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, color: 'white' }}>
                {label}
            </span>
        </div>
    );

    return (
        <section style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '80px 0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Abstract Background Elem */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'rgba(255, 107, 0, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'rgba(255, 107, 0, 0.2)', 
                        color: '#FF6B00',
                        padding: '6px 16px',
                        borderRadius: '99px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Clock size={16} /> Exam Date: May 15, 2026
                    </div>

                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '3rem' }}>
                        Time Remaining for PUCET 2026
                    </h2>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '1.5rem', 
                        flexWrap: 'wrap',
                        marginBottom: '3rem'
                    }}>
                        <TimeBlock value={timeLeft.days} label="Days" />
                        <TimeBlock value={timeLeft.hours} label="Hours" />
                        <TimeBlock value={timeLeft.minutes} label="Minutes" />
                        <TimeBlock value={timeLeft.seconds} label="Seconds" />
                    </div>

                    <Link href="/pucet-mock" style={{ display: 'inline-block' }}>
                         <motion.button 
                            className={styles.btnPrimary} // Using Hero button styles
                            style={{ 
                                background: '#FF6B00', 
                                color: 'white',
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Your Prep Now
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CountdownSection;
