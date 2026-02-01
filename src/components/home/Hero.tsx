'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './Hero.module.css';
import FreeMockTestModal from './FreeMockTestModal';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Google-level animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const // Google's easing curve
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotate: -5
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        delay: 0.3
      }
    }
  };

  return (
    <>
    <section className={styles.hero}>
      <div className="container">
      <div className={styles.heroWrapper}>
          <motion.div 
            className={styles.heroContent}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
              <motion.span className={styles.badge} variants={itemVariants}>
                PUPAPERS: Official Prep Partner
              </motion.span>
              <motion.h1 className={styles.title} variants={itemVariants}>
                Panjab University <span>Chandigarh</span> Previous Year Papers & Mocks
              </motion.h1>
              <motion.p className={styles.description} variants={itemVariants}>
                The most secure and optimized platform for PU CET. Access thousands of MCQs, previous year PDF papers, and real-time mock tests for MSc, BSc, and more.
              </motion.p>
              <motion.div 
                className={styles.ctaGroup} 
                style={{ position: 'relative', zIndex: 100 }}
                variants={itemVariants}
              >
                <motion.button 
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  Take Free Mock Test <ArrowRight size={20} />
                </motion.button>
                <Link 
                  href="/previous-papers"
                  className={styles.secondaryBtn}
                >
                  View Previous Papers
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className={styles.heroImage}
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              <div className={styles.imageContainer}>
                <BookOpen size={120} color="white" />
              </div>
              
              <motion.div 
                className={`${styles.floatingCard} ${styles.card1}`}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 107, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle color="#FF6B00" size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1a1a1a', letterSpacing: '-0.01em' }}>5000+ MCQs</div>
                    <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '2px' }}>Updated for 2026</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className={`${styles.floatingCard} ${styles.card2}`}
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock color="white" size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>Real-time Results</div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '2px' }}>Instant analysis</div>
                  </div>
                </div>
              </motion.div>
          </motion.div>
        </div>
      </div>
      </section>

      <FreeMockTestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Hero;
