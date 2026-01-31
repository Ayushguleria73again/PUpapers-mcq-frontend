'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import styles from './SubjectGrid.module.css';

interface Subject {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  streams?: string[];
}

interface SubjectGridProps {
  selectedStream?: 'medical' | 'non-medical' | null;
  onBack?: () => void;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ selectedStream, onBack }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/subjects`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const filteredSubjects = selectedStream 
    ? subjects.filter(s => s.streams?.includes(selectedStream))
    : subjects;

  if (loading) {
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
              style={{ 
                position: 'absolute', left: '2rem', top: '1rem', 
                background: 'none', border: 'none', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#64748b', fontWeight: 600
              }}
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
