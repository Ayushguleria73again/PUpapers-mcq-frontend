'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Lock, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import styles from '@/components/auth/Auth.module.css';

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialEmail = searchParams.get('email') || '';

    const [formData, setFormData] = useState({
        email: initialEmail,
        otp: '',
        newPassword: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            await apiFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setStatus('success');
            // Redirect to login
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || 'Reset failed');
        }
    };

    if (status === 'success') {
        return (
             <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Password Reset!</h3>
                <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>Your password has been successfully updated.</p>
                
                <Link href="/login">
                    <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        className={`btn-primary ${styles.submitBtn}`}
                    >
                        Go to Login
                    </motion.button>
                </Link>
            </div>
        );
    }

    return (
         <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrapper}>
                     {/* Using key={formData.email} ensures it re-renders if email changes, though typically static here */}
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        style={{ background: '#f8f9fa', color: '#666' }}
                        readOnly
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Verification Code (OTP)</label>
                <div className={styles.inputWrapper}>
                    <KeyRound className={styles.inputIcon} size={18} />
                    <input 
                        type="text" 
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="123456"
                        required
                        maxLength={6}
                        style={{ letterSpacing: '2px', fontFamily: 'monospace' }}
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={18} />
                    <input 
                        type="password" 
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="••••••••"
                        required
                        minLength={6}
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
                {status === 'loading' ? 'Resetting...' : 'Reset Password'} 
                {!status.startsWith('load') && <ArrowRight size={18} />}
            </motion.button>
        </form>
    );
};

export default function ResetPasswordPage() {
    return (
        <main className={styles.authPage}>
            <div className={styles.brandingSide}>
                <Image src="/auth-bg.png" alt="Branding" fill className={styles.bgImage} priority sizes="(max-width: 768px) 100vw, 50vw" />
                <motion.div className={styles.brandingContent} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className={styles.brandingTitle}>Secure Account.</h2>
                    <p className={styles.brandingSubtitle}>Create a strong password to protect your progress.</p>
                </motion.div>
            </div>

            <div className={styles.formSide}>
                <motion.div className={styles.authCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className={styles.authHeader}>
                        <Link href="/" className={styles.logo}>
                            <GraduationCap size={28} color="#FF6B00" />
                            <p>pu<span>papers</span>.com</p>
                        </Link>
                        <h1 className={styles.title}>Set New Password</h1>
                        <p className={styles.subtitle}>Enter the verification code sent to your email.</p>
                    </div>

                    <Suspense fallback={<div>Loading...</div>}>
                        <ResetPasswordContent />
                    </Suspense>
                </motion.div>
            </div>
        </main>
    );
}
