'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './SubjectGrid.module.css';

import { useContent } from '@/context/ContentContext';

interface SubjectGridProps {
  selectedStream?: 'medical' | 'non-medical' | null;
  onBack?: () => void;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ selectedStream, onBack }) => {
  const { subjects, loadingSubjects } = useContent();

  const filteredSubjects = selectedStream 
    ? subjects.filter(s => s.streams?.includes(selectedStream))
    : subjects;

  if (loadingSubjects) {
    return (
      <section className={styles.section}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          Loading subjects...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
              {onBack && (
            <button 
              onClick={onBack}
              className={styles.backBtn}
            >
              ← Change Stream
            </button>
          )}
          <h2>
            {selectedStream === 'medical' ? 'Medical' : selectedStream === 'non-medical' ? 'Non-Medical' : 'Explore'} <span>Subjects</span>
          </h2>
          <p>Choose your focus area and start practicing with our curated MCQ sets designed specifically for PU CET.</p>
        </div>

        <div className={styles.grid}>
          {filteredSubjects.map((subject, index) => (
            <Link href={`/mock-tests/${subject.slug}`} key={subject._id} style={{ textDecoration: 'none' }}>
              <motion.div 
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.overlay} />
                <div className={styles.iconWrapper} style={{ overflow: 'hidden', padding: 0 }}>
                  <img 
                    src={subject.image} 
                    alt={subject.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=' + subject.name[0];
                    }}
                  />
                </div>
                <h3 className={styles.cardTitle}>{subject.name}</h3>
                <p className={styles.cardDesc}>{subject.description}</p>
                <div className={styles.stats}>
                  <span>Practice Now</span>
                  <span>➜</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;
