'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Book, FileQuestion, Check, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';

// Modular Components
import SubjectForm from '@/components/admin/SubjectForm';
import ChapterForm from '@/components/admin/ChapterForm';
import QuestionForm from '@/components/admin/QuestionForm';
import ContentManager from '@/components/admin/ContentManager';

interface Subject {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
}

interface Chapter {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    subject: string | Subject;
}

interface Question {
    _id: string;
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string;
    difficulty: string;
    subject: string | Subject;
    chapter?: string | Chapter;
}

interface User {
    _id: string;
    email: string;
    role: string;
}


const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('subject'); // 'subject', 'chapter', 'question', 'manage'
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [editItem, setEditItem] = useState<Subject | Chapter | Question | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const userData = await apiFetch<User>('/auth/me');
            if (userData?.role === 'admin') {
                setIsAdmin(true);
                fetchSubjects();
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            router.push('/login');
        }
    };

    const fetchSubjects = async () => {
        try {
            const data = await apiFetch<Subject[]>('/content/subjects');
            setSubjects(data);
        } catch (err) {
            console.error('Subject Load Error');
        }
    };

    const fetchChapters = async (subjectId: string) => {
        if (!subjectId) return;
        try {
            const data = await apiFetch<Chapter[]>(`/content/chapters?subjectId=${subjectId}`);
            setChapters(data);
        } catch (err) {
            console.error('Chapter Load Error');
        }
    };

    const fetchQuestions = async (subjectId: string, chapterId: string) => {
        try {
            let endpoint = `/content/questions?subjectId=${subjectId}`;
            if (chapterId) endpoint += `&chapterId=${chapterId}`;
            const data = await apiFetch<Question[]>(endpoint);
            setQuestions(data);
        } catch (err) {
            console.error('Question Load Error');
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        
        try {
            await apiFetch(`/content/${type}/${id}`, {
                method: 'DELETE'
            });

            setMessage({ type: 'success', text: 'Deleted successfully' });
            if (type === 'subjects') fetchSubjects();
        } catch (err: unknown) {
            const error = err as Error;
            setMessage({ type: 'error', text: error.message || 'Server error' });
        }
    };

    const handleEdit = (type: string, item: Subject | Chapter | Question) => {
        setEditItem(item);
        setActiveTab(type); // 'subject', 'chapter', 'question'
        if (type === 'chapter' || type === 'question') {
            const itemWithSubject = item as Chapter | Question;
            const subId = typeof itemWithSubject.subject === 'object' ? itemWithSubject.subject._id : itemWithSubject.subject;
            if (subId) fetchChapters(subId);
        }
    };

    const handleSuccess = (msg: string) => {
        setMessage({ type: 'success', text: msg });
        if (editItem) setActiveTab('manage');
        setEditItem(null);
        setTimeout(() => setMessage(null), 5000);
    };

    const handleError = (msg: string) => {
        setMessage({ type: 'error', text: msg });
        setTimeout(() => setMessage(null), 5000);
    };

    if (!isAdmin) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin-loading 1s linear infinite' }}></div>
                <p style={{ color: '#666' }}>Secure Login...</p>
                <style>{`@keyframes spin-loading { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, background: '#2c3e50', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>Admin Panel</h1>
                        <p style={{ color: '#666' }}>Manage subjects and questions.</p>
                    </div>
                </div>
                <Link href="/" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem' }}>
                    Go to Website
                </Link>
            </div>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', 
                        background: message.type === 'success' ? '#eafaf1' : '#fdedec',
                        color: message.type === 'success' ? '#2ecc71' : '#e74c3c',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        border: `1px solid ${message.type === 'success' ? '#2ecc71' : '#e74c3c'}`
                    }}
                >
                    {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }}>
                {/* Sidebar */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #eee' }}>
                    {[
                        { id: 'subject', label: 'Add Subject', icon: <BookOpen size={18} /> },
                        { id: 'chapter', label: 'Add Chapter', icon: <Book size={18} /> },
                        { id: 'question', label: 'Add Question', icon: <FileQuestion size={18} /> },
                        { id: 'manage', label: 'Manage Content', icon: <Trash2 size={18} /> }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditItem(null); }}
                            style={{ 
                                width: '100%', padding: '1rem', textAlign: 'left', borderRadius: '8px', 
                                background: activeTab === tab.id ? '#FF6B00' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#333',
                                fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Area */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #eee', minHeight: '600px' }}>
                    {activeTab === 'subject' && (
                        <SubjectForm editItem={editItem as Subject | null} onSuccess={handleSuccess} onError={handleError} onCancel={() => {setEditItem(null); setActiveTab('manage');}} refreshSubjects={fetchSubjects} />
                    )}
                    {activeTab === 'chapter' && (
                        <ChapterForm editItem={editItem as Chapter | null} subjects={subjects} onSuccess={handleSuccess} onError={handleError} onCancel={() => {setEditItem(null); setActiveTab('manage');}} refreshChapters={() => {
                            const item = editItem as Chapter | null;
                            if (item) {
                                const subId = typeof item.subject === 'object' ? item.subject._id : item.subject;
                                fetchChapters(subId);
                            }
                        }} />
                    )}
                    {activeTab === 'question' && (
                        <QuestionForm editItem={editItem as Question | null} subjects={subjects} chapters={chapters} onSubjectChange={fetchChapters} onSuccess={handleSuccess} onError={handleError} onCancel={() => {setEditItem(null); setActiveTab('manage');}} />
                    )}
                    {activeTab === 'manage' && (
                        <ContentManager subjects={subjects} chapters={chapters} questions={questions} onEdit={handleEdit} onDelete={handleDelete} onFetchChapters={fetchChapters} onFetchQuestions={fetchQuestions} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
