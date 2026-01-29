'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, GraduationCap, Github, LogIn } from 'lucide-react';
import styles from '@/components/auth/Auth.module.css';

const SignupPage = () => {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [step, setStep] = React.useState(1); // 1: Signup Form, 2: OTP Verification
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  // Handle Signup Form Submission (Step 1)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Success - Move to OTP step
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification (Step 2)
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to resend OTP');
      alert('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d{1,6}$/.test(data)) return;

    const newOtp = [...otp];
    data.split('').forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);
    
    const nextFocusIndex = Math.min(data.length, 5);
    document.getElementById(`otp-${nextFocusIndex}`)?.focus();
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.brandingSide}>
        <Image 
          src="/auth-bg.png" 
          alt="Branding Background" 
          fill 
          className={styles.bgImage} 
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <motion.div 
          className={styles.brandingContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className={styles.brandingTitle}>
            Step into Excellence.
          </h2>
          <p className={styles.brandingSubtitle}>
            Join thousands of successful candidates who used our platform to clear PU CET Chandigarh. Your journey starts with a simple click.
          </p>
        </motion.div>
      </div>

      <div className={styles.formSide}>
        <motion.div 
          className={styles.authCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.authHeader}>
            <Link href="/" className={styles.logo}>
              <GraduationCap size={28} color="#FF6B00" />
              <p>pu<span>papers</span>.com</p>
            </Link>
            <h1 className={styles.title}>{step === 1 ? 'Join the Community' : 'Verify Email'}</h1>
            <p className={styles.subtitle}>
              {step === 1 
                ? 'Create your free account to access all features' 
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          <form className={styles.form} onSubmit={step === 1 ? handleSubmit : handleVerifyOTP}>
            {error && (
              <div style={{ color: '#ff4d4d', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ color: '#2ecc71', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(46, 204, 113, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                Success! Taking you to your dashboard...
              </div>
            )}

            {step === 1 ? (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} size={18} />
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Ayush"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} size={18} />
                    <input 
                      type="email" 
                      className={styles.input} 
                      placeholder="ayush@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={18} />
                    <input 
                      type="password" 
                      className={styles.input} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="terms" style={{ marginTop: '0.2rem', accentColor: 'var(--primary)' }} required />
                  <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    I agree to the <Link href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</Link> and <Link href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</Link>.
                  </label>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={data}
                      onChange={e => handleOtpChange(e, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      onFocus={e => e.target.select()}
                      style={{
                        width: '45px',
                        height: '55px',
                        background: '#f8f9fa',
                        border: '2px solid #eee',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onWheel={e => (e.target as HTMLInputElement).blur()}
                      className="otp-input"
                    />
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={handleResendOTP} 
                  disabled={resending}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--primary)', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {resending ? 'Resending...' : "Didn't receive code? Resend"}
                </button>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className={`btn-primary ${styles.submitBtn}`}
              disabled={loading || success}
              style={{ marginTop: '1.5rem' }}
            >
              {step === 1 ? (
                <>
                  <UserPlus size={20} /> {loading ? 'Creating...' : 'Create Account'}
                </>
              ) : (
                <>
                  <LogIn size={20} /> {loading ? 'Verifying...' : 'Verify & Sign In'}
                </>
              )}
            </motion.button>
          </form>

          {step === 1 && (
            <p className={styles.footer}>
              Already have an account? 
              <Link href="/login" className={styles.footerLink}>Log in</Link>
            </p>
          )}
          
          {step === 2 && (
            <button 
              onClick={() => setStep(1)} 
              style={{ 
                width: '100%', 
                background: 'transparent', 
                border: 'none', 
                color: '#888', 
                marginTop: '1.5rem', 
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ← Back to Signup
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default SignupPage;
