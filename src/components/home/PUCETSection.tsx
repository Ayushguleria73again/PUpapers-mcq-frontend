'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Award, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import styles from './SubjectGrid.module.css';

const PUCETSection = () => {
  const items = [
    {
      id: 'full-mock',
      title: 'Full Mock Test',
      description: 'Complete 60-question exam simulation for PCB & PCM streams.',
      icon: <Award size={32} />,
      link: '/pucet-mock',
      color: '#FF6B00'
    },
    {
      id: 'previous-papers',
      title: 'Previous Papers',
      description: 'Practice with official PUCET question papers from the last 10 years.',
      icon: <FileText size={32} />,
      link: '/previous-papers', // Placeholder route
      color: '#3B82F6'
    },
    {
      id: 'syllabus',
      title: 'Syllabus & Pattern',
      description: 'Detailed breakdown of the exam pattern and marking scheme.',
      icon: <BookOpen size={32} />,
      link: '/syllabus', // Placeholder route
      color: '#10B981'
    }
  ];

  return (
    <section className={styles.section} style={{ background: '#f8fafc', paddingTop: '50px' }}>
      <div className="container">
        <div className={styles.header}>
          <h2>PUCET <span>Champions</span> Zone</h2>
          <p>Everything you need to ace the Panjab University Common Entrance Test.</p>
        </div>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <Link href={item.link} key={item.id} style={{ textDecoration: 'none' }}>
              <motion.div 
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{ background: 'white' }}
              >
                <div className={styles.overlay} />
                <div className={styles.iconWrapper} style={{ color: item.color, background: `${item.color}15` }}>
                  {item.icon}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <div className={styles.stats} style={{ color: item.color }}>
                  <span>Explore</span>
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PUCETSection;
