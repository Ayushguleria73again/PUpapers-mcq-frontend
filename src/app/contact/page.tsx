'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Mail, MapPin, Phone, Send, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './contact.module.css';

const ContactPage = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />
            
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.title}
                    >
                        Get in <span className={styles.highlight}>Touch</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={styles.subtitle}
                    >
                        Have questions about the PU CET exam or our platform? We're here to help you ace your preparation.
                    </motion.p>
                </div>
                
                {/* Decorative Elements */}
                <div className={styles.decorativeCircle1} />
                <div className={styles.decorativeCircle2} />
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.gridContainer}>
                    
                    {/* Contact Form Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={styles.formCard}
                    >
                        <h2 className={styles.formTitle}>
                            <MessageSquare size={28} className="text-orange-500" /> 
                            Send Message
                        </h2>
                        
                        <form style={{ display: 'grid', gap: '1.2rem' }} onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="Ayush" 
                                        className={styles.input} 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        placeholder="ayush@example.com" 
                                        className={styles.input} 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    placeholder="How can we help?" 
                                    className={styles.input} 
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Message</label>
                                <textarea 
                                    name="message"
                                    rows={5} 
                                    placeholder="Tell us about your query..." 
                                    className={styles.textarea}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            
                            <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                                {status === 'loading' ? 'Sending...' : 'Send Message'} <Send size={18} />
                            </button>

                            {status === 'success' && (
                                <p style={{ color: '#10b981', textAlign: 'center', marginTop: '0.5rem', fontWeight: 600 }}>Message sent successfully!</p>
                            )}
                            {status === 'error' && (
                                <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '0.5rem', fontWeight: 600 }}>Failed to send message.</p>
                            )}
                        </form>
                    </motion.div>

                    {/* Info Cards */}
                    <div className={styles.infoCardsGrid}>
                         <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={styles.infoCard}
                        >
                            <div className={styles.iconWrapper}>
                                <Mail size={28} />
                            </div>
                            <div>
                                <h3 className={styles.infoTitle}>Email Support</h3>
                                <p className={styles.infoText} style={{ marginBottom: '0.2rem' }}>General Inquiries</p>
                                <a href="mailto:support@pupapers.com" style={{ color: '#FF6B00', fontWeight: 600, textDecoration: 'none' }}>support@pupapers.com</a>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className={styles.infoCard}
                        >
                            <div className={styles.iconWrapper}>
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h3 className={styles.infoTitle}>University Office</h3>
                                <p className={styles.infoText}>
                                    Sector 14, Panjab University<br />
                                    Chandigarh, 160014
                                </p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className={styles.infoCard}
                        >
                            <div className={styles.iconWrapper}>
                                <Clock size={28} />
                            </div>
                            <div>
                                <h3 className={styles.infoTitle}>Response Time</h3>
                                <p className={styles.infoText}>
                                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                                    <span style={{ fontSize: '0.85rem', color: '#999' }}>Usually replies within 24 hours</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Quick FAQ or Promo */}
                        <motion.div 
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.5, delay: 0.6 }}
                             className={styles.promoCard}
                        >
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem' }}>Ready to start?</h3>
                            <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '1.5rem' }}>Don't let doubts stop your preparation. Join thousands of students today.</p>
                            <a href="/login" className={styles.promoBtn}>
                                Get Started Free <ArrowRight size={16} />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
