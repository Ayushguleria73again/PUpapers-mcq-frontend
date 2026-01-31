'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    const pathname = usePathname();

    // Hide footer on login, signup, active quiz pages, and admin panel
    if (
        pathname === '/login' || 
        pathname === '/signup' || 
        pathname === '/forgot-password' || 
        pathname === '/reset-password' || 
        (pathname.startsWith('/mock-tests/') && pathname !== '/mock-tests') ||
        pathname.startsWith('/admin')
    ) {
        return null;
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.column}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <GraduationCap size={24} color="#FF6B00" />
                        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>pupapers.com</span>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                        The ultimate platform for Panjab University CET preparation. Ace your exams with our comprehensive mock tests and previous year papers.
                    </p>
                </div>

                <div className={styles.column}>
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link href="/mock-tests" className={styles.link}>Mock Tests</Link></li>
                        <li><Link href="/previous-papers" className={styles.link}>Previous Papers</Link></li>
                        <li><Link href="/leaderboard" className={styles.link}>Leaderboard</Link></li>
                        <li><Link href="/about" className={styles.link}>About Us</Link></li>
                        <li><Link href="/faq" className={styles.link}>FAQ</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h3>Legal</h3>
                    <ul>
                        <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
                        <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
                        <li><Link href="/contact" className={styles.link}>Contact Us</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h3>Connect</h3>
                    <div className={styles.socials}>
                        <a href="#" className={styles.link}><Facebook size={20} /></a>
                        <a href="#" className={styles.link}><Twitter size={20} /></a>
                        <a href="#" className={styles.link}><Instagram size={20} /></a>
                        <a href="#" className={styles.link}><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>

            <div className={styles.copyright}>
                &copy; {new Date().getFullYear()} pupapers.com. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
