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
  Play,
  Settings,
  Trash2,
  X,
  AlertTriangle,
  User as UserIcon,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Dashboard.module.css';
import { AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/utils/api';

const DashboardPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [progress, setProgress] = React.useState<any>(null);
  const [loadingProgress, setLoadingProgress] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const [deleteStep, setDeleteStep] = React.useState(0); // 0: None, 1: Confirm, 2: Final Verify
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProgress = async () => {
      try {
        console.log('Fetching progress...');
        const progressData = await apiFetch<any>('/content/progress');
        console.log('Progress data received:', progressData);
        setProgress(progressData);
      } catch (err: any) {
        console.error('Failed to load dashboard data', err);
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoadingProgress(false);
      }
    };

    if (user) {
        fetchProgress();
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiFetch('/auth/account', {
        method: 'DELETE',
      });

      await logout();
      router.push('/');
    } catch (err) {
      console.error('Delete account failed', err);
      alert('An error occurred. Please try again.');
      setIsDeleting(false);
      setDeleteStep(0);
    }
  };

  if (authLoading || loadingProgress) {
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

  if (!user) {
      window.location.href = '/login'; 
      return null;
  }

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
            <div className={styles.heroHeader}>
                <div>
                    <h1>Welcome back, <span>{user.fullName.split(' ')[0]}</span></h1>
                    <p>Keep practicing to stay ahead in your PU CET Chandigarh preparation.</p>
                    {error && (
                      <div style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        Error: {error}. Check console for details.
                      </div>
                    )}
                </div>
                <button className={styles.settingsBtn} onClick={() => setShowSettings(!showSettings)}>
                    {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className={styles.headerAvatar} />
                    ) : (
                        <Settings size={24} />
                    )}
                </button>
                
                <AnimatePresence>
                    {showSettings && (
                        <motion.div 
                            className={styles.settingsDropdown}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        >
                            <Link href="/profile" className={styles.settingsLink}>
                                <UserIcon size={16} /> Edit Profile
                            </Link>
                            <div className={styles.divider}></div>
                            <button className={styles.deleteAccountBtn} onClick={() => { setDeleteStep(1); setShowSettings(false); }}>
                                <Trash2 size={16} /> Delete Account
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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
          <div className={styles.actionButtons}>
            <Link href="/mock-tests" className={styles.startBtn} style={{ textDecoration: 'none' }}>
              <Play size={20} fill="currentColor" /> Start Practice Set
            </Link>
            <Link href="/revision" className={styles.vaultBtn} style={{ textDecoration: 'none' }}>
              <Bookmark size={20} /> Revision Vault
            </Link>
          </div>
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

      {/* Account Deletion Modal */}
      <AnimatePresence>
        {deleteStep > 0 && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.alertIcon}>
                  <AlertTriangle size={32} />
                </div>
                <button className={styles.closeBtn} onClick={() => setDeleteStep(0)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {deleteStep === 1 ? (
                  <>
                    <h2>Delete Account?</h2>
                    <p>This will permanently remove your profile, all quiz results, and mastery progress. <strong>This action cannot be undone.</strong></p>
                    <div className={styles.modalActions}>
                      <button className={styles.cancelBtn} onClick={() => setDeleteStep(0)}>Cancel</button>
                      <button className={styles.confirmDeleteBtn} onClick={() => setDeleteStep(2)}>
                        Yes, Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2>Are you absolutely sure?</h2>
                    <p>Enter your full name <strong>"{user.fullName}"</strong> to confirm permanent deletion.</p>
                    <input 
                      type="text" 
                      className={styles.confirmInput}
                      placeholder="Type your full name here"
                      onChange={(e) => {
                        if (e.target.value === user.fullName) {
                          // Allow deletion
                        }
                      }}
                      id="delete-confirm-input"
                    />
                    <div className={styles.modalActions}>
                      <button className={styles.cancelBtn} onClick={() => setDeleteStep(0)}>Abort</button>
                      <button 
                        className={styles.finalDeleteBtn}
                        disabled={isDeleting}
                        onClick={() => {
                          const input = document.getElementById('delete-confirm-input') as HTMLInputElement;
                          if (input.value === user.fullName) {
                            handleDeleteAccount();
                          } else {
                            alert('Name does not match exactly!');
                          }
                        }}
                      >
                        {isDeleting ? 'Deleting...' : 'Permanently Delete My Data'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
