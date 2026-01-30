'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
        fetchLeaderboard('all');
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/subjects`);
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (err) {
            console.error('Failed to fetch subjects');
        }
    };

    const fetchLeaderboard = async (subjectId: string) => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/content/leaderboard`;
            if (subjectId !== 'all') {
                url += `?subjectId=${subjectId}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subjectId = e.target.value;
        setSelectedSubject(subjectId);
        fetchLeaderboard(subjectId);
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="text-yellow-500" size={24} fill="currentColor" />;
        if (index === 1) return <Medal className="text-gray-400" size={24} fill="currentColor" />; // Silver
        if (index === 2) return <Medal className="text-amber-700" size={24} fill="currentColor" />; // Bronze
        return <span className="font-bold text-gray-500">#{index + 1}</span>;
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh' }}>
            <Navbar />
            
            <div className="container" style={{ padding: '6rem 1rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}
                    >
                        <Trophy size={48} color="#FF6B00" />
                    </motion.div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem' }}>Student Leaderboard</h1>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Celebrating achievements and top performers.</p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <select 
                            value={selectedSubject}
                            onChange={handleFilterChange}
                            style={{ 
                                padding: '0.8rem 1.5rem', 
                                borderRadius: '30px', 
                                border: '1px solid #ddd', 
                                background: 'white',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                fontSize: '1rem',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Subjects</option>
                            {subjects.map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Leaderboard Table/List */}
                    <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', padding: '1.2rem 2rem', borderBottom: '1px solid #eee', background: '#fafafa', color: '#666', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <div>Rank</div>
                            <div>Student</div>
                            <div style={{ textAlign: 'center' }}>Tests</div>
                            <div style={{ textAlign: 'right' }}>Score</div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
                                Loading rankings...
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
                                No results found yet. Be the first to take a test!
                            </div>
                        ) : (
                            leaderboard.map((user, index) => (
                                <motion.div 
                                    key={user._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '80px 1fr 100px 100px', 
                                        padding: '1.2rem 2rem', 
                                        borderBottom: '1px solid #f5f5f5', 
                                        alignItems: 'center',
                                        background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'white'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '30px' }}>
                                        {getRankIcon(index)}
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ 
                                            width: 40, height: 40, 
                                            borderRadius: '50%', 
                                            background: `hsl(${(index * 137) % 360}, 70%, 80%)`, 
                                            color: '#333',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontWeight: 700
                                        }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#333' }}>
                                            {user.name}
                                            {index === 0 && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#FFD700', color: '#B4690E', padding: '2px 8px', borderRadius: '10px' }}>CHAMPION</span>}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', color: '#666', fontWeight: 500 }}>
                                        {user.testsTaken}
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: '#FF6B00', fontSize: '1.1rem' }}>
                                            {user.totalScore}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                            {user.avgPercentage}% Avg
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
