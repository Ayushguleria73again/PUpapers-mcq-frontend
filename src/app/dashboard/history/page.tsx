'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, History, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  subject: string;
  slug: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
}

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/history`, {
            credentials: 'include'
        });
        if (res.ok) {
            const data = await res.json();
            setHistory(data);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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

  return (
    <div className="container" style={{ padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontWeight: 500 }}>
            <ChevronLeft size={20} /> Back to Dashboard
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#FFF3E0', color: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={24} />
            </div>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Full Quiz History</h1>
                <p style={{ color: '#666' }}>Track your progress and performance over time.</p>
            </div>
        </div>

        {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid #eee' }}>
                <FileText size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                <h3>No history found</h3>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>You haven't taken any quizzes yet.</p>
                <Link href="/mock-tests" className="btn-primary">
                    Start a Mock Test
                </Link>
            </div>
        ) : (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#444' }}>Subject</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#444' }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#444' }}>Score</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#444' }}>Percentage</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#444' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, index) => (
                                <tr key={item.id} style={{ borderTop: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.subject}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#666', fontSize: '0.95rem' }}>{item.date}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.score} / {item.totalQuestions}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '100px', height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${item.percentage}%`, height: '100%', background: item.percentage >= 80 ? '#2ecc71' : item.percentage >= 50 ? '#f1c40f' : '#e74c3c' }} />
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>{item.percentage}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {item.percentage >= 80 ? (
                                            <span style={{ background: '#eafaf1', color: '#2ecc71', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Excellent</span>
                                        ) : item.percentage >= 50 ? (
                                            <span style={{ background: '#fef9e7', color: '#f1c40f', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Good</span>
                                        ) : (
                                            <span style={{ background: '#fdedec', color: '#e74c3c', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Needs Work</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
