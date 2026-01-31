'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Calculator, ArrowRight } from 'lucide-react';
import styles from './StreamSelector.module.css';

interface StreamSelectorProps {
  onSelect: (stream: 'medical' | 'non-medical') => void;
}

const StreamSelector: React.FC<StreamSelectorProps> = ({ onSelect }) => {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Select Your <span>Stream</span></h2>
          <p>Choose your path to get tailored mock tests for PU CET.</p>
        </div>

        <div className={styles.grid}>
          <motion.div 
            className={`${styles.card} ${styles.medical}`}
            onClick={() => onSelect('medical')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.iconWrapper}>
              <Activity size={32} />
            </div>
            <div className={styles.content}>
              <h3>Medical (PCB)</h3>
              <p>Physics, Chemistry, Biology</p>
              <span className={styles.cta}>Select <ArrowRight size={16} /></span>
            </div>
          </motion.div>

          <motion.div 
            className={`${styles.card} ${styles.nonMedical}`}
            onClick={() => onSelect('non-medical')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.iconWrapper}>
              <Calculator size={32} />
            </div>
            <div className={styles.content}>
              <h3>Non-Medical (PCM)</h3>
              <p>Physics, Chemistry, Mathematics</p>
              <span className={styles.cta}>Select <ArrowRight size={16} /></span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StreamSelector;
