'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import styles from '@/components/auth/Auth.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            setStatus('success');
            // Redirect can be handled by user manually or via link, but auto-redirect is nice
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 3000);
        } catch (err: unknown) {
            const error = err as Error;
            setStatus('error');
            setErrorMsg(error.message || 'Failed to connect to server');
        }
    };

    return (
        <main className={styles.authPage}>
            <div className={styles.brandingSide}>
                 <Image src="/auth-bg.png" alt="Branding" fill className={styles.bgImage} priority sizes="(max-width: 768px) 100vw, 50vw" />
                <motion.div className={styles.brandingContent} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className={styles.brandingTitle}>Recover Access.</h2>
                    <p className={styles.brandingSubtitle}>Get back to your preparation without missing a beat.</p>
                </motion.div>
            </div>

            <div className={styles.formSide}>
                <motion.div className={styles.authCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className={styles.authHeader}>
                        <Link href="/" className={styles.logo}>
                            <GraduationCap size={28} color="#FF6B00" />
                            <p>pu<span>papers</span>.com</p>
                        </Link>
                        <h1 className={styles.title}>Forgot Password?</h1>
                        <p className={styles.subtitle}>Enter your email and we&apos;ll send you a code to reset your password.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Code Sent!</h3>
                            <p className={styles.subtitle} style={{ marginBottom: '1rem' }}>Check your email for the reset code.</p>
                            <p className="text-slate-500 text-xs mt-4">Redirecting...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email Address</label>
                                <div className={styles.inputWrapper}>
                                    <Mail className={styles.inputIcon} size={18} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.input}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                type="submit" 
                                disabled={status === 'loading'}
                                className={`btn-primary ${styles.submitBtn}`}
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Reset Code'} 
                                {!status.startsWith('load') && <ArrowRight size={18} />}
                            </motion.button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/login" className={styles.footerLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
