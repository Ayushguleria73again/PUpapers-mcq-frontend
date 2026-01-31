'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, MessageCircle, HelpCircle, GraduationCap, ShieldCheck, Zap } from 'lucide-react';
import styles from './faq.module.css';
import Link from 'next/link';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'General' | 'Mock Tests' | 'Account' | 'Technical';
}

const faqs: FAQItem[] = [
    {
        id: '1',
        category: 'General',
        question: 'What is PUpapers.com?',
        answer: 'PUpapers.com is a dedicated platform for students preparing for the Panjab University Common Entrance Test (PU CET). We provide mock tests, previous year question papers, and comprehensive study materials to help you ace your exams.'
    },
    {
        id: '2',
        category: 'Mock Tests',
        question: 'Are the mock tests free?',
        answer: 'Yes! We offer a wide range of free mock tests for Physics, Chemistry, and Mathematics. We believe in accessible education for everyone. Some premium advanced tests may be introduced in the future.'
    },
    {
        id: '3',
        category: 'Account',
        question: 'Do I need to sign up to take a test?',
        answer: 'While you can browse the site without an account, you must be logged in to take mock tests. This allows us to track your progress, save your scores, and provide personalized performance analytics.'
    },
    {
        id: '4',
        category: 'Mock Tests',
        question: 'How is the score calculated?',
        answer: 'Our scoring system mimics the actual PU CET pattern. You get +2 marks for every correct answer and -0.5 marks for every wrong answer. Unattempted questions carry zero marks.'
    },
    {
        id: '5',
        category: 'Technical',
        question: 'The website is slow on my phone. What should I do?',
        answer: 'Our platform is optimized for mobile devices, but a stable internet connection is required. Try clearing your browser cache or switching to a better network. PUpapers works best on Chrome and Safari.'
    },
    {
        id: '6',
        category: 'Account',
        question: 'How do I reset my password?',
        answer: 'Click on the "Login" button and select "Forgot Password". Enter your registered email address, and we will send you an OTP to verify your identity and set a new password.'
    },
    {
        id: '7',
        category: 'General',
        question: 'Can I download the previous year papers?',
        answer: 'Yes, previous year papers are available in the "Previous Papers" section. You can view them online or download them as PDFs for offline practice.'
    },
    {
        id: '8',
        category: 'Technical',
        question: 'I found a wrong question/answer. How do I report it?',
        answer: 'We strive for accuracy, but errors can occur. Please use the "Contact Us" form or email us at support@pupapers.com with the Question ID or a screenshot. We will review and fix it immediately.'
    }
];

const categories = ['All', 'General', 'Mock Tests', 'Account', 'Technical'];

const FAQPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={styles.pageContainer}>
            <div className="container">
                {/* Hero Section */}
                <header className={styles.heroSection}>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.title}
                    >
                        How can we help you?
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={styles.subtitle}
                    >
                        Search for answers or browse through our most frequently asked questions.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={styles.searchContainer}
                    >
                        <Search className={styles.searchIcon} size={20} />
                        <input 
                            type="text" 
                            placeholder="Search questions (e.g., 'password', 'mock test')" 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </header>

                {/* Categories */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={styles.categoriesContainer}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.activeCategory : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* FAQ List */}
                <div className={styles.faqContainer}>
                    <AnimatePresence>
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq, index) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={styles.faqItem}
                                >
                                    <button 
                                        className={styles.questionButton}
                                        onClick={() => toggleItem(faq.id)}
                                        aria-expanded={openItem === faq.id}
                                    >
                                        {faq.question}
                                        <span className={`${styles.iconWrapper} ${openItem === faq.id ? styles.activeIcon : ''}`}>
                                            {openItem === faq.id ? <Minus size={18} /> : <Plus size={18} />}
                                        </span>
                                    </button>
                                    
                                    <AnimatePresence>
                                        {openItem === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className={styles.answerContainer}
                                            >
                                                <div className={styles.answerContent}>
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className={styles.noResults}
                            >
                                <HelpCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No matching questions found.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Contact Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={styles.contactSection}
                >
                    <h2 className={styles.contactTitle}>Still have questions?</h2>
                    <p className={styles.contactText}>Can't find the answer you're looking for? Please have a chat with our friendly team.</p>
                    <Link href="/contact" className={styles.contactBtn}>
                        <MessageCircle size={18} />
                        Get in Touch
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQPage;
