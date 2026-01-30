'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FreeMockTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FreeMockTestModal = ({ isOpen, onClose }: FreeMockTestModalProps) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStream, setSelectedStream] = useState<'PCB' | 'PCM' | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUserStatus();
        }
    }, [isOpen]);

    const fetchUserStatus = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null); // Not logged in
            }
        } catch (err) {
            console.error('Failed to fetch user status');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const remainingTests = user ? 5 - (user.freeTestsTaken || 0) : 5;
    const isLimitReached = remainingTests <= 0 && !user?.isPremium;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-6">
                            <span className="inline-block p-3 rounded-full bg-orange-100 text-orange-600 mb-4">
                                <BookOpen size={32} />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Free Mock Test</h2>
                            <p className="text-slate-600">Experience the real PUCET exam environment.</p>
                        </div>

                        {!user ? (
                            <div className="text-center p-6 bg-slate-50 rounded-xl mb-6">
                                <Lock size={48} className="mx-auto text-slate-400 mb-3" />
                                <h3 className="font-semibold text-slate-800 mb-2">Login Required</h3>
                                <p className="text-sm text-slate-500 mb-4">You need to log in to track your free attempts.</p>
                                <Link href="/login">
                                    <button className="btn-primary w-full py-2">Log In to Continue</button>
                                </Link>
                            </div>
                        ) : loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : isLimitReached ? (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                                <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
                                <h3 className="font-bold text-slate-800 mb-2">Free Limit Reached</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    You have used all 5 free mock tests. Upgrade to Premium for unlimited access.
                                </p>
                                <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                    Upgrade to Premium
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        <span className="font-medium">Free Attempts Remaining</span>
                                    </div>
                                    <span className="font-bold text-xl">{remainingTests}/5</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Select Your Stream:</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setSelectedStream('PCB')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                selectedStream === 'PCB' 
                                                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                                : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="font-bold text-lg">PCB</span>
                                            <span className="text-xs opacity-80">Phy, Chem, Bio</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedStream('PCM')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                selectedStream === 'PCM' 
                                                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                                : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="font-bold text-lg">PCM</span>
                                            <span className="text-xs opacity-80">Phy, Chem, Math</span>
                                        </button>
                                    </div>
                                </div>

                                <Link 
                                    href={selectedStream ? `/pucet-mock?stream=${selectedStream}` : '#'}
                                    className={!selectedStream ? 'pointer-events-none' : ''}
                                >
                                    <button 
                                        disabled={!selectedStream}
                                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                            selectedStream 
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Start Mock Test <ArrowRight size={20} />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FreeMockTestModal;
