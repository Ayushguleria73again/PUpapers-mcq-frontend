'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                // Redirect to login
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setStatus('error');
                setErrorMsg(data.message || 'Reset failed');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Failed to connect to server');
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h1>
                    <p className="text-slate-600">Enter the verification code sent to your email and choose a new password.</p>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                         <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Password Reset!</h3>
                        <p className="text-slate-600 text-sm">Your password has been successfully updated.</p>
                        <Link href="/login">
                            <button className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                                Go to Login
                            </button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code (OTP)</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all tracking-widest font-mono"
                                    placeholder="123456"
                                    required
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'} 
                            {!status.startsWith('load') && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-32 pb-20 px-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
