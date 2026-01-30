'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    User as UserIcon, 
    Camera, 
    Mail, 
    Phone, 
    School, 
    Save, 
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import styles from './Profile.module.css';
import Link from 'next/link';

interface UserData {
    fullName: string;
    email: string;
    profileImage: string;
    bio: string;
    phone: string;
    institution: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Cleanup object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error('Failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (user) {
            setUser({ ...user, [name]: value });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        
        // Instant local preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile-image`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setUser({ ...user, profileImage: data.url });
                // Note: We keep previewUrl until next mount/change to avoid flicker
            } else {
                alert('Failed to upload image. Please try again.');
                setPreviewUrl(null);
            }
        } catch (err) {
            console.error('Image upload failed', err);
            alert('An error occurred during upload.');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: user.fullName,
                    bio: user.bio,
                    phone: user.phone,
                    institution: user.institution
                }),
                credentials: 'include'
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Profile update failed', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 40, height: 40, border: '3px solid #FF6B00', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.backBtn}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>

                <motion.div 
                    className={styles.profileCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.header}>
                        <h1>Profile Settings</h1>
                        <p>Manage your account information and preferences</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.profileSection}>
                        <div className={styles.imageUploadSection}>
                            <div className={styles.imagePreviewWrapper}>
                                {previewUrl || user.profileImage ? (
                                    <img 
                                        src={previewUrl || user.profileImage} 
                                        alt="Profile" 
                                        className={styles.previewImage} 
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {user.fullName.charAt(0)}
                                    </div>
                                )}
                                {uploading && (
                                    <div className={styles.uploadOverlay} style={{ opacity: 1 }}>
                                        Updating...
                                    </div>
                                )}
                                <div className={styles.uploadOverlay}>
                                    <Camera size={16} /> Change Photo
                                </div>
                            </div>
                            <label className={styles.uploadLabel}>
                                <Camera size={16} /> 
                                {uploading ? 'Uploading...' : 'Change Photo'}
                                <input 
                                    type="file" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    name="fullName"
                                    value={user.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="email" 
                                        value={user.email} 
                                        disabled 
                                    />
                                    <Mail size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Bio</label>
                                <textarea 
                                    name="bio"
                                    value={user.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us a bit about yourself..."
                                    rows={3}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={user.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 00000 00000"
                                    />
                                    <Phone size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Institution / School</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        name="institution"
                                        value={user.institution}
                                        onChange={handleInputChange}
                                        placeholder="Panjab University"
                                    />
                                    <School size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className={styles.saveBtn}
                                disabled={saving}
                            >
                                {success ? (
                                    <>
                                        <CheckCircle size={20} /> Settings Saved
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} /> {saving ? 'Saving Changes...' : 'Save Profile'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <style jsx>{`
                .backBtn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 2rem;
                    transition: color 0.2s ease;
                }
                .backBtn:hover {
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
}
