'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, BookOpen, Book, FileQuestion, Check, AlertCircle, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, Eye, Code } from 'lucide-react';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('subject'); // 'subject', 'chapter', 'question'
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Subject Form States
    const [subName, setSubName] = useState('');
    const [subSlug, setSubSlug] = useState('');
    const [subIcon, setSubIcon] = useState('Book');
    const [subDesc, setSubDesc] = useState('');
    const [subImageFile, setSubImageFile] = useState<File | null>(null);

    // Chapter Form States
    const [chapName, setChapName] = useState('');
    const [chapSlug, setChapSlug] = useState('');
    const [chapDesc, setChapDesc] = useState('');
    const [chapSubjectId, setChapSubjectId] = useState('');

    // Question Form States
    const [qSubjectId, setQSubjectId] = useState('');
    const [qChapterId, setQChapterId] = useState('');
    const [qText, setQText] = useState('');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);
    const [qExplanation, setQExplanation] = useState('');
    const [qDifficulty, setQDifficulty] = useState('medium');
    const [manageType, setManageType] = useState('subject'); // 'subject', 'chapter', 'question'
    const [questionsList, setQuestionsList] = useState<any[]>([]);

    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    // Hoisted functions to avoid Temporal Dead Zone (ReferenceErrors)
    async function checkAdmin() {
        try {
            console.log('Verifying admin credentials...');
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
                cache: 'no-store'
            });
            
            if (res.ok) {
                const userData = await res.json();
                console.log('User Role:', userData?.role);
                
                if (userData?.role === 'admin') {
                    setIsAdmin(true);
                    fetchSubjects();
                } else {
                    console.warn('Access denied: Unauthorized role');
                    router.push('/dashboard');
                }
            } else {
                console.error('Auth verification failed:', res.status);
                router.push('/login');
            }
        } catch (err: any) {
            console.error('Auth Loop Error:', err.message);
            router.push('/login');
        }
    }

    async function fetchSubjects() {
        try {
            const res = await fetch('/api/content/subjects');
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
                if (data.length > 0) {
                    const firstId = data[0]._id;
                    setQSubjectId(firstId);
                    setChapSubjectId(firstId);
                }
            }
        } catch (err) {
            console.error('Subject Load Error');
        }
    }

    async function fetchChapters(subjectId: string) {
        try {
            const res = await fetch(`/api/content/chapters?subjectId=${subjectId}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setChapters(data);
            }
        } catch (err) {
            console.error('Chapter Load Error');
        }
    }

    useEffect(() => {
        checkAdmin();
    }, []);

    // Fetch chapters when qSubjectId changes
    useEffect(() => {
        if (qSubjectId) {
            fetchChapters(qSubjectId);
        } else {
            setChapters([]);
        }
    }, [qSubjectId]);

    if (!isAdmin) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin-loading 1s linear infinite' }}></div>
                <p style={{ color: '#666' }}>Secure Login...</p>
                <style>{`
                    @keyframes spin-loading { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const MarkdownEditor = ({ value, onChange, placeholder, label }: { value: string, onChange: (val: string) => void, placeholder?: string, label: string }) => {
        const [isPreview, setIsPreview] = useState(false);
        const [uploading, setUploading] = useState(false);
        const fileInputRef = React.useRef<HTMLInputElement>(null);

        const insertText = (before: string, after: string = '') => {
            const textarea = document.activeElement as HTMLTextAreaElement;
            if (!textarea || textarea.tagName !== 'TEXTAREA') return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selected = text.substring(start, end);
            const newValue = text.substring(0, start) + before + selected + after + text.substring(end);
            onChange(newValue);
            
            // Refocus and set cursor
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + before.length, end + before.length);
            }, 0);
        };

        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await fetch('/api/content/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    insertText(`![image](${data.url})`);
                } else {
                    alert('Upload failed');
                }
            } catch (err) {
                console.error('Upload Error:', err);
                alert('Server error during upload');
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        return (
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>{label}</label>
                    <button 
                        type="button" 
                        onClick={() => setIsPreview(!isPreview)}
                        style={{ fontSize: '0.8rem', color: '#FF6B00', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                        {isPreview ? <Code size={14} /> : <Eye size={14} />} {isPreview ? 'Switch to Editor' : 'Live Preview'}
                    </button>
                </div>

                {!isPreview ? (
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                        {/* Toolbar */}
                        <div style={{ background: '#f8f9fa', padding: '8px', borderBottom: '1px solid #ddd', display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={() => insertText('**', '**')} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer' }} title="Bold"><Bold size={16} /></button>
                            <button type="button" onClick={() => insertText('_', '_')} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer' }} title="Italic"><Italic size={16} /></button>
                            <button type="button" onClick={() => insertText('- ')} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer' }} title="List"><List size={16} /></button>
                            <button type="button" onClick={() => insertText('[', '](url)')} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer' }} title="Link"><LinkIcon size={16} /></button>
                            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: uploading ? '#888' : 'inherit' }} title="Upload Image">
                                <ImageIcon size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                        </div>
                        <textarea 
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            rows={6}
                            style={{ width: '100%', padding: '1rem', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: '0.95rem' }}
                        />
                    </div>
                ) : (
                    <div className="markdown-preview" style={{ 
                        padding: '1rem', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        minHeight: '175px', 
                        background: '#fafafa',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                    }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*No content to preview*'}</ReactMarkdown>
                    </div>
                )}
                <style jsx global>{`
                    .markdown-preview img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
                    .markdown-preview ul { padding-left: 1.5rem; margin: 10px 0; }
                    .markdown-preview p { margin: 10px 0; }
                `}</style>
            </div>
        );
    };

    const handleSubjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', subName);
            formData.append('slug', subSlug);
            formData.append('description', subDesc);
            
            if (subImageFile) {
                formData.append('image', subImageFile);
            } else if (subIcon) {
                formData.append('image', subIcon);
            }

            const url = editId 
                ? `${process.env.NEXT_PUBLIC_API_URL}/content/subjects/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/content/subjects`;
            
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Subject ${editId ? 'updated' : 'created'} successfully!` });
                if (!editId) {
                    setSubName('');
                    setSubSlug('');
                    setSubDesc('');
                    setSubIcon('');
                    setSubImageFile(null);
                } else {
                    setEditId(null);
                    setSubImageFile(null); 
                    setActiveTab('manage'); 
                    setManageType('subject');
                }
                fetchSubjects();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Failed to save subject' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/content/questions?subjectId=${qSubjectId}`;
            if (qChapterId) {
                url += `&chapterId=${qChapterId}`;
            }
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setQuestionsList(data);
            }
        } catch (err) {
            console.error('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: 'subjects' | 'chapters' | 'questions', id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                credentials: 'include'
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Deleted successfully' });
                // Refresh data
                if (type === 'subjects') fetchSubjects();
                if (type === 'chapters') fetchChapters(chapSubjectId || qSubjectId);
                if (type === 'questions') fetchQuestions();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: 'subject' | 'chapter' | 'question', item: any) => {
        setEditId(item._id);
        
        if (type === 'subject') {
            setActiveTab('subject');
            setSubName(item.name || '');
            setSubSlug(item.slug || '');
            setSubDesc(item.description || '');
            setSubIcon(typeof item.image === 'string' ? item.image : ''); 
        } else if (type === 'chapter') {
            setActiveTab('chapter');
            setChapName(item.name || '');
            setChapSlug(item.slug || '');
            setChapDesc(item.description || '');
            setChapSubjectId(item.subject?._id || item.subject || '');
        } else if (type === 'question') {
            setActiveTab('question');
            setQSubjectId(item.subject?._id || item.subject || '');
            setQChapterId(item.chapter?._id || item.chapter || '');
            setQText(item.text || '');
            setQOptions(item.options || ['', '', '', '']);
            setQCorrect(item.correctOption ?? 0);
            setQExplanation(item.explanation || '');
            setQDifficulty(item.difficulty || 'medium');
        }
    };

    const cancelEdit = () => {
        setEditId(null);
        // Clear forms
        setSubName(''); setSubSlug(''); setSubDesc(''); setSubIcon(''); setSubImageFile(null);
        setChapName(''); setChapSlug(''); setChapDesc('');
        setQText(''); setQOptions(['', '', '', '']); setQExplanation('');
        setMessage(null);
    };

    const handleChapterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const url = editId 
                ? `${process.env.NEXT_PUBLIC_API_URL}/content/chapters/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/content/chapters`;
            
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: chapName,
                    slug: chapSlug,
                    subjectId: chapSubjectId,
                    description: chapDesc
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Chapter ${editId ? 'updated' : 'created'} successfully!` });
                if (!editId) {
                    setChapName('');
                    setChapSlug('');
                    setChapDesc('');
                } else {
                    setEditId(null);
                    setActiveTab('manage');
                    setManageType('chapter');
                }
                // If the chapter was added/updated to the currently selected question subject, refresh chapters
                if (chapSubjectId === qSubjectId) {
                    fetchChapters(qSubjectId);
                }
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Failed to save chapter' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const url = editId 
                ? `${process.env.NEXT_PUBLIC_API_URL}/content/questions/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/content/questions`;
                
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    subjectId: qSubjectId,
                    chapterId: qChapterId || null, 
                    text: qText,
                    options: qOptions,
                    correctOption: qCorrect,
                    explanation: qExplanation,
                    difficulty: qDifficulty
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Question ${editId ? 'updated' : 'added'} successfully!` });
                if (!editId) {
                    setQText('');
                    setQOptions(['', '', '', '']);
                    setQExplanation('');
                } else {
                    setEditId(null);
                    setActiveTab('manage');
                    setManageType('question');
                    fetchQuestions(); // Refresh question list if in view
                }
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Failed to save question' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...qOptions];
        newOptions[index] = value;
        setQOptions(newOptions);
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')        // Replace spaces with -
            .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
            .replace(/\-\-+/g, '-')      // Replace multiple - with single -
            .replace(/^-+/, '')          // Trim - from start of text
            .replace(/-+$/, '');         // Trim - from end of text
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
            {/* ... header ... */ }
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
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        marginBottom: '1.5rem', 
                        background: message.type === 'success' ? '#eafaf1' : '#fdedec',
                        color: message.type === 'success' ? '#2ecc71' : '#e74c3c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: `1px solid ${message.type === 'success' ? '#2ecc71' : '#e74c3c'}`
                    }}
                >
                    {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }}>
                {/* Sidebar / Tabs */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #eee' }}>
                    <button 
                        onClick={() => setActiveTab('subject')}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            textAlign: 'left', 
                            borderRadius: '8px', 
                            background: activeTab === 'subject' ? '#FF6B00' : 'transparent',
                            color: activeTab === 'subject' ? 'white' : '#333',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <BookOpen size={18} /> Add Subject
                    </button>
                    <button 
                        onClick={() => setActiveTab('chapter')}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            textAlign: 'left', 
                            borderRadius: '8px', 
                            background: activeTab === 'chapter' ? '#FF6B00' : 'transparent',
                            color: activeTab === 'chapter' ? 'white' : '#333',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Book size={18} /> Add Chapter
                    </button>
                    <button 
                        onClick={() => setActiveTab('question')}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            textAlign: 'left', 
                            borderRadius: '8px', 
                            background: activeTab === 'question' ? '#FF6B00' : 'transparent',
                            color: activeTab === 'question' ? 'white' : '#333',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <FileQuestion size={18} /> Add Question
                    </button>
                    <button 
                        onClick={() => setActiveTab('manage')}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            textAlign: 'left', 
                            borderRadius: '8px', 
                            background: activeTab === 'manage' ? '#FF6B00' : 'transparent',
                            color: activeTab === 'manage' ? 'white' : '#333',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Trash2 size={18} /> Manage Content
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #eee' }}>
                    {activeTab === 'subject' ? (
                        <form onSubmit={handleSubjectSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editId ? 'Edit Subject' : 'Add New Subject'}</h2>
                                {editId && <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Name</label>
                                <input 
                                    type="text" 
                                    value={subName || ''}
                                    onChange={(e) => {
                                        setSubName(e.target.value);
                                        setSubSlug(slugify(e.target.value));
                                    }}
                                    required 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Slug (URL ID)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        value={subSlug || ''}
                                        onChange={(e) => setSubSlug(e.target.value)}
                                        required 
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f9fa' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setSubSlug(slugify(subName))}
                                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: '#f1f1f1' }}
                                        title="Regenerate slug from name"
                                    >
                                        ↺
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Image</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setSubImageFile(e.target.files?.[0] || null)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                                    />
                                    {!subImageFile && (
                                        <>
                                            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>OR</div>
                                            <input 
                                                type="url" 
                                                value={subIcon || ''}
                                                onChange={(e) => setSubIcon(e.target.value)}
                                                placeholder="Enter Image URL (optional)"
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            />
                                        </>
                                    )}
                                </div>
                                <small style={{ color: '#888' }}>Upload an image or provide a direct link.</small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                                <textarea 
                                    value={subDesc || ''}
                                    onChange={(e) => setSubDesc(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Saving...' : (editId ? 'Update Subject' : 'Create Subject')}
                            </button>
                        </form>
                    ) : activeTab === 'chapter' ? (
                        <form onSubmit={handleChapterSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editId ? 'Edit Chapter' : 'Add New Chapter'}</h2>
                                {editId && <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Subject</label>
                                <select 
                                    value={chapSubjectId || ''}
                                    onChange={(e) => setChapSubjectId(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    {subjects.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Chapter Name</label>
                                <input 
                                    type="text" 
                                    value={chapName || ''}
                                    onChange={(e) => {
                                        setChapName(e.target.value);
                                        setChapSlug(slugify(e.target.value));
                                    }}
                                    required 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Slug (URL ID)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        value={chapSlug || ''}
                                        onChange={(e) => setChapSlug(e.target.value)}
                                        required 
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f9fa' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setChapSlug(slugify(chapName))}
                                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: '#f1f1f1' }}
                                        title="Regenerate slug from name"
                                    >
                                        ↺
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                                <textarea 
                                    value={chapDesc || ''}
                                    onChange={(e) => setChapDesc(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Saving...' : (editId ? 'Update Chapter' : 'Create Chapter')}
                            </button>
                        </form>
                    ) : activeTab === 'manage' ? (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Manage Content</h2>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <button 
                                    onClick={() => setManageType('subject')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        background: manageType === 'subject' ? '#2c3e50' : '#f1f1f1',
                                        color: manageType === 'subject' ? 'white' : '#333',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >Subjects</button>
                                <button 
                                    onClick={() => setManageType('chapter')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        background: manageType === 'chapter' ? '#2c3e50' : '#f1f1f1',
                                        color: manageType === 'chapter' ? 'white' : '#333',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >Chapters</button>
                                <button 
                                    onClick={() => setManageType('question')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        background: manageType === 'question' ? '#2c3e50' : '#f1f1f1',
                                        color: manageType === 'question' ? 'white' : '#333',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >Questions</button>
                            </div>

                            {manageType === 'subject' && (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {subjects.map(sub => (
                                        <div key={sub._id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <img 
                                                    src={sub.image || 'https://placehold.co/400x300?text=' + sub.name[0]} 
                                                    alt={sub.name}
                                                    style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{sub.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>/{sub.slug}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => handleEdit('subject', sub)}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    disabled={loading}
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete('subjects', sub._id)}
                                                    className="btn-danger"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#e74c3c', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                                    disabled={loading}
                                                >
                                                    {loading ? '...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {manageType === 'chapter' && (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <select 
                                        value={chapSubjectId || ''}
                                        onChange={(e) => {
                                            setChapSubjectId(e.target.value);
                                            fetchChapters(e.target.value);
                                        }}
                                        style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px' }}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>

                                    {chapters.map(chap => (
                                        <div key={chap._id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{chap.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>/{chap.slug}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => handleEdit('chapter', chap)}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    disabled={loading}
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete('chapters', chap._id)}
                                                     style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#e74c3c', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                                     disabled={loading}
                                                >
                                                    {loading ? '...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {chapters.length === 0 && <p style={{ color: '#888' }}>No chapters found or select a subject.</p>}
                                </div>
                            )}

                            {manageType === 'question' && (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <select 
                                            value={qSubjectId || ''}
                                            onChange={(e) => setQSubjectId(e.target.value)}
                                            style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px' }}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                        </select>
                                        <select 
                                            value={qChapterId || ''}
                                            onChange={(e) => setQChapterId(e.target.value)}
                                            style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px' }}
                                        >
                                            <option value="">Select Chapter (Optional)</option>
                                            {chapters.map(chap => (
                                                <option key={chap._id} value={chap._id}>{chap.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Questions would need to be fetched here based on filters, for now showing a generic list or message */}
                                    {/* Simple implementation: Fetch questions on button click or effect */}
                                    <button 
                                        type="button"
                                        onClick={fetchQuestions}
                                        style={{ padding: '0.5rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Fetching...' : 'Fetch Questions'}
                                    </button>

                                    {questionsList.map((q: any) => (
                                        <div key={q._id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ maxWidth: '80%' }}>
                                                <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{q.text.substring(0, 80)}...</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    {q.subject?.name} {q.chapter && `> ${q.chapter.name}`} • {q.difficulty}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => handleEdit('question', q)}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    disabled={loading}
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete('questions', q._id)}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#e74c3c', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                                    disabled={loading}
                                                >
                                                    {loading ? '...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    ) : (
                        <form onSubmit={handleQuestionSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editId ? 'Edit Question' : 'Add New Question'}</h2>
                                {editId && <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Subject</label>
                                    <select 
                                        value={qSubjectId || ''}
                                        onChange={(e) => setQSubjectId(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    >
                                        {subjects.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Chapter</label>
                                    <select 
                                        value={qChapterId || ''}
                                        onChange={(e) => setQChapterId(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    >
                                        <option value="">-- No Chapter --</option>
                                        {chapters.map(chap => (
                                            <option key={chap._id} value={chap._id}>{chap.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <MarkdownEditor 
                                label="Question Text (Markdown supported)"
                                value={qText || ''}
                                onChange={setQText}
                                placeholder="Enter your question here... Use Markdown for formatting and images."
                            />

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Options</label>
                                <div style={{ display: 'grid', gap: '0.8rem' }}>
                                    {qOptions.map((opt, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '20px', fontWeight: 600 }}>{String.fromCharCode(65 + idx)}</span>
                                            <input 
                                                type="text" 
                                                value={opt || ''}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                required
                                                placeholder={`Option ${idx + 1}`}
                                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            />
                                            <input 
                                                type="radio" 
                                                name="correctOption"
                                                checked={qCorrect === idx}
                                                onChange={() => setQCorrect(idx)}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <small style={{ color: '#888' }}>Select the radio button next to the correct answer.</small>
                            </div>

                            <MarkdownEditor 
                                label="Explanation (Markdown supported)"
                                value={qExplanation || ''}
                                onChange={setQExplanation}
                                placeholder="Explain why the correct answer is right..."
                            />

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Difficulty</label>
                                <select 
                                    value={qDifficulty || 'medium'}
                                    onChange={(e) => setQDifficulty(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Saving...' : (editId ? 'Update Question' : 'Add Question')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
