'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, GraduationCap } from 'lucide-react';
import styles from '@/components/auth/Auth.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import { User } from '@/context/AuthContext';
interface LoginResponse {
  requiresOTP?: boolean;
  user: User; 
}

interface OtpResponse {
  user: User;
}

const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [step, setStep] = React.useState(1); // 1: Login, 2: Verification
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.requiresOTP) {
        setStep(2); // OTP step
      } else {
        login(data.user);
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const errorObj = err as Error & { data?: { unverified?: boolean } };
      if (errorObj.data?.unverified) {
        setStep(2);
      } else {
        setError(errorObj.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpString = otp.join('');
    try {
      const data = await apiFetch<OtpResponse>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpString }),
      });

      login(data.user);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError((err as Error).message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      alert('OTP Resent!');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.brandingSide}>
        <Image src="/auth-bg.png" alt="Branding" fill className={styles.bgImage} priority sizes="(max-width: 768px) 100vw, 50vw" />
        <motion.div className={styles.brandingContent} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className={styles.brandingTitle}>Welcome Back Scholar.</h2>
          <p className={styles.brandingSubtitle}>Access your tests and tracking in one place.</p>
        </motion.div>
      </div>

      <div className={styles.formSide}>
        <motion.div className={styles.authCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className={styles.authHeader}>
            <Link href="/" className={styles.logo}>
              <GraduationCap size={28} color="#FF6B00" />
              <p>pu<span>papers</span>.com</p>
            </Link>
            <h1 className={styles.title}>{step === 1 ? 'Sign in' : 'Verify Email'}</h1>
            <p className={styles.subtitle}>{step === 1 ? 'Enter your details to login' : `Verify the code sent to ${email}`}</p>
          </div>

          <form className={styles.form} onSubmit={step === 1 ? handleSubmit : handleVerifyOTP}>
            {error && <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

            {step === 1 ? (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} size={18} />
                    <input type="email" className={styles.input} placeholder="ayush@example.com" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required />
                  </div>
                </div>
                  <div className={styles.inputGroup}>
                   <label className={styles.label}>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={18} />
                    <input type="password" className={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(e, i)} onKeyDown={e => handleKeyDown(e, i)} className="otp-input" style={{ width: '45px', height: '55px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', border: '2px solid #eee', borderRadius: '12px', outline: 'none', color: '#FF6B00' }} />
                  ))}
                </div>
                <button type="button" onClick={handleResendOTP} disabled={resending} style={{ border: 'none', background: 'transparent', color: '#FF6B00', fontWeight: '600' }}>
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading} style={{ marginTop: '10px' }}>
              <LogIn size={20} /> {loading ? 'Processing...' : step === 1 ? 'Sign In' : 'Verify & Enter'}
            </motion.button>
          </form>

          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ width: '100%', border: 'none', background: 'transparent', color: '#888', marginTop: '15px' }}>← Back to Login</button>
          )}

          {step === 1 && (
            <p className={styles.footer}>New here? <Link href="/signup" className={styles.footerLink}>Create account</Link></p>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default LoginPage;
