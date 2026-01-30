'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                // Redirect to reset page after brief delay
                setTimeout(() => {
                    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setStatus('error');
                setErrorMsg(data.message || 'Something went wrong');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            <div className="pt-32 pb-20 px-4">
                <div className="max-w-md mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
                            <p className="text-slate-600">Enter your email and we'll send you a code to reset your password.</p>
                        </div>

                        {status === 'success' ? (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Code Sent!</h3>
                                <p className="text-slate-600 text-sm">Check your email for the reset code.</p>
                                <p className="text-slate-500 text-xs mt-4">Redirecting...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                            placeholder="you@example.com"
                                            required
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
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Code'} 
                                    {!status.startsWith('load') && <ArrowRight size={18} />}
                                </button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-slate-500 hover:text-slate-800 text-sm font-medium inline-flex items-center gap-1 transition-colors">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
