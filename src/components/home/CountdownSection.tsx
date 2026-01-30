'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './CountdownSection.module.css';

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
        <div className={styles.timeBlock}>
            <span className={styles.timeValue}>
                {String(value).padStart(2, '0')}
            </span>
            <span className={styles.timeLabel}>
                {label}
            </span>
        </div>
    );

    return (
        <section className={styles.section}>
            {/* Abstract Background Elem */}
            <div className={styles.abstractBg} />

            <div className={`container ${styles.contentWrapper}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.dateBadge}>
                        <Clock size={16} /> Exam Date: May 15, 2026
                    </div>

                    <h2 className={styles.title}>
                        Time Remaining for PUCET 2026
                    </h2>

                    <div className={styles.timerWrapper}>
                        <TimeBlock value={timeLeft.days} label="Days" />
                        <TimeBlock value={timeLeft.hours} label="Hours" />
                        <TimeBlock value={timeLeft.minutes} label="Minutes" />
                        <TimeBlock value={timeLeft.seconds} label="Seconds" />
                    </div>

                    <Link href="/pucet-mock" style={{ display: 'inline-block' }}>
                         <motion.button 
                            className={styles.ctaButton}
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
