'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Clock } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={`${styles.container} container`}>
      <div className={styles.heroWrapper}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
            <span className={styles.badge}>Official PU CET Prep Partner</span>
            <h1 className={styles.title}>
              Master Your <span>Entrance</span> Exams with Confidence
            </h1>
            <p className={styles.description}>
              The ultimate platform for Panjab University Chandigarh Common Entrance Test (CET) preparation. Access thousands of MCQs, previous year papers, and real-time mock tests.
            </p>
            <div className={styles.ctaGroup} style={{ position: 'relative', zIndex: 100 }}>
              <Link href="/pucet-mock" style={{ display: 'block' }}>
                <motion.button 
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Take Full Mock Test <ArrowRight size={20} />
                </motion.button>
              </Link>
              <button className={styles.secondaryBtn} onClick={() => console.log("Hero CTA Rendering Check")}>
                View Previous Papers
              </button>
            </div>
          </motion.div>

          <motion.div 
            className={styles.heroImage}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.imageContainer}>
              <BookOpen size={120} color="white" />
            </div>
            
            <motion.div 
              className={`${styles.floatingCard} ${styles.card1}`}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle color="#FF6B00" size={24} />
                <span style={{ fontWeight: 700 }}>5000+ MCQs</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>Updated for 2026</p>
            </motion.div>

            <motion.div 
              className={`${styles.floatingCard} ${styles.card2}`}
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock color="white" size={24} />
                <span style={{ fontWeight: 700 }}>Real-time Results</span>
              </div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Instant performance analysis</p>
            </motion.div>
        </motion.div>
      </div>
    </div>
    </section>
  );
};

export default Hero;
