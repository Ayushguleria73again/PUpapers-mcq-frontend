'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Search, File, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';
import styles from './PreviousPapers.module.css';

interface Paper {
    _id: string;
    title: string;
    year: number;
    stream: string;
    subject?: {
        name: string;
    };
}

export default function PreviousPapersPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState('all');

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const data = await apiFetch<Paper[]>('/content/papers');
            setPapers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPapers = papers.filter(p => {
        const matchYear = filterYear === 'all' || p.year.toString() === filterYear;
        return matchYear;
    });

    const years = Array.from(new Set(papers.map(p => p.year))).sort((a,b) => b-a);

    return (
        <main className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.headerSection}>
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className={styles.headerIcon}>
                            <FileText size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className={styles.headerTitle}>
                            Previous Year <span>Papers</span>
                        </h1>
                        <p className={styles.headerSubtitle}>
                            Practice with authentic previous year question papers. Select your stream and year to get started.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Filters */}
                <div className={styles.filtersContainer}>
                    <div className={styles.filterLabel}>
                        <Search size={18} />
                        Filter Papers:
                    </div>

                    <select 
                        value={filterYear} 
                        onChange={e => setFilterYear(e.target.value)}
                        className={styles.selectInput}
                    >
                        <option value="all">All Years</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading papers...</div>
                ) : filteredPapers.length > 0 ? (
                    <div className={styles.papersGrid}>
                        {filteredPapers.map((paper) => (
                            <motion.div 
                                key={paper._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={styles.paperCard}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.yearBadge}>
                                            {paper.year}
                                        </div>
                                        <div className={styles.streamBadge}>
                                            <BookOpen size={14} /> {paper.stream}
                                        </div>
                                    </div>
                                    
                                    <h3 className={styles.paperTitle}>
                                        {paper.title}
                                    </h3>
                                    
                                    {paper.subject && (
                                        <p className={styles.subjectText}>
                                            Subject: <span>{paper.subject.name}</span>
                                        </p>
                                    )}

                                    <Link 
                                        href={`/previous-papers/${paper._id}`}
                                        className={styles.attemptBtn}
                                    >
                                        Attempt Paper <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <File className={styles.emptyIcon} size={48} />
                        <h3>No papers found</h3>
                        <p>Try adjusting your search filters</p>
                    </div>
                )}
            </div>
        </main>
    );
}
