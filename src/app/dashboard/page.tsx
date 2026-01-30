'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Award,
  Play
} from 'lucide-react';
import Link from 'next/link';
import styles from './Dashboard.module.css';

const DashboardPage = () => {
  const [user, setUser] = React.useState<any>(null);
  const [progress, setProgress] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include'
        });
        
        if (!userRes.ok) {
          window.location.href = '/login';
          return;
        }
        
        const userData = await userRes.json();
        setUser(userData);

        // Fetch Progress
        const progressRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/progress`, {
          credentials: 'include'
        });

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData);
        }

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 40, height: 40, border: '3px solid #FF6B00', borderTopColor: 'transparent', borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { label: 'Tests Taken', value: progress?.totalTests || '0', icon: BookOpen, color: '#FF6B00' },
    { label: 'Avg Base Score', value: `${progress?.avgPercentage || 0}%`, icon: Target, color: '#2ecc71' },
    { label: 'Your Level', value: `Lvl ${progress?.level || 1}`, icon: Trophy, color: '#3498db' },
  ];

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.heroSection}>
        <div className="container">
          <motion.div 
            className={styles.welcomeText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Welcome back, <span>{user.fullName.split(' ')[0]}</span></h1>
            <p>Keep practicing to stay ahead in your PU CET Chandigarh preparation.</p>
          </motion.div>
        </div>
      </header>

      <div className={`${styles.contentContainer} container`}>
        {/* Simple Stats Row */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.statIcon} style={{ background: `${stat.color}10`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className={styles.statInfo}>
                <h3>{stat.label}</h3>
                <div className={styles.statValue}>{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Action Callout */}
        <motion.div 
          className={styles.mainAction}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.actionContent}>
            <h2>Ready for a new challenge?</h2>
            <p>Take a practice set curated specifically for your weak areas.</p>
          </div>
          <button className={styles.startBtn} onClick={() => window.location.href = '/mock-tests'}>
            <Play size={20} fill="currentColor" /> Start Practice Set
          </button>
        </motion.div>

        {/* Subject Mastery Section */}
        <section className={styles.masterySection}>
          <div className={styles.sectionHeader} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Subject Mastery</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Global performance per discipline</p>
          </div>
          
          <div className={styles.masteryGrid}>
            {progress?.subjectProgress?.map((subject: any, idx: number) => (
              <motion.div 
                key={subject.id}
                className={styles.masteryCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
              >
                <div className={styles.subjectHeader}>
                  <h4>{subject.name}</h4>
                  <span className={styles.testCount}>{subject.testsCount} {subject.testsCount === 1 ? 'Test' : 'Tests'}</span>
                </div>

                <div className={styles.progressWrapper}>
                  <div className={styles.progressLabel}>
                    <span>Current Mastery</span>
                    <span className={styles.accuracyValue}>{subject.accuracy}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <motion.div 
                      className={styles.progressFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.accuracy}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom Split Section */}
        <div className={styles.sectionsGrid}>
          {/* Recent Performance */}
          <motion.section 
            className={styles.sectionBox}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <h3>Recent Performance</h3>
              <Link href="/dashboard/history" className={styles.viewAll}>View Full History</Link>
            </div>
            {progress?.recentActivity?.length > 0 ? (
                <div className={styles.activityList}>
                {progress.recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className={styles.activityItem}>
                    <div className={styles.activityInfo}>
                        <h4>{activity.subject}</h4>
                        <p>{activity.date} • Practice</p>
                    </div>
                    <div className={styles.scoreBadge}>{activity.score}</div>
                    </div>
                ))}
                </div>
            ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    No recent activity. Take a test to see your progress!
                </div>
            )}
          </motion.section>

          {/* Goals & Achievements */}
          <motion.section 
            className={styles.sectionBox}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.sectionHeader}>
              <h3>Your Achievements</h3>
              <span className={styles.viewAll}>All Badges</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FDF2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#E67E22' }}>
                  <Award size={32} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Top {(progress?.avgPercentage || 0) > 80 ? '5%' : '20%'}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#2E7D32' }}>
                  <TrendingUp size={32} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Consistent</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#1565C0' }}>
                  <Trophy size={32} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lvl {progress?.level || 1}</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Overall Accuracy</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>{progress?.avgPercentage || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress?.avgPercentage || 0}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  style={{ height: '100%', background: 'var(--primary)' }} 
                />
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
