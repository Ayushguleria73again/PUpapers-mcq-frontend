'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import ReactMarkdown from 'react-markdown';

interface Subject {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
}

interface SubjectFormProps {
    editItem: Subject | null;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    onCancel: () => void;
    refreshSubjects: () => void;
}

const SubjectForm = ({ editItem, onSuccess, onError, onCancel, refreshSubjects }: SubjectFormProps) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [icon, setIcon] = useState('Book');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setName(editItem.name || '');
            setSlug(editItem.slug || '');
            setDescription(editItem.description || '');
            setIcon(typeof editItem.image === 'string' ? editItem.image : '');
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setIcon('Book');
            setImageFile(null);
        }
    }, [editItem]);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('slug', slug);
            formData.append('description', description);
            
            if (imageFile) {
                formData.append('image', imageFile);
            } else if (icon) {
                formData.append('image', icon);
            }

            const endpoint = editItem 
                ? `/content/subjects/${editItem._id}`
                : `/content/subjects`;
            
            const method = editItem ? 'PUT' : 'POST';

            await apiFetch(endpoint, {
                method,
                body: formData // apiFetch will handle FormData (don't set application/json)
            });

            onSuccess(`Subject ${editItem ? 'updated' : 'created'} successfully!`);
            if (!editItem) {
                setName(''); setSlug(''); setDescription(''); setIcon('Book'); setImageFile(null);
            }
            refreshSubjects();
        } catch (err: unknown) {
            const error = err as Error;
            onError(error.message || 'Failed to save subject');
        } finally {
            setLoading(false);
        }
    };

    // AI Chat State
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: 'Hi! I can help you draft descriptions, suggest slugs, or brainstorm subject content. What do you need?' }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    // Auto-scroll to bottom of chat
    const chatEndRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (showChat) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, showChat]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setChatLoading(true);

        try {
            const data = await apiFetch<{ reply: string }>('/content/chat', {
                method: 'POST',
                body: JSON.stringify({ 
                    message: userMsg,
                    context: `Managing Subject: ${name || 'New Subject'}. Description: ${description}`
                })
            });

            setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (err: unknown) {
            const error = err as Error;
            setChatMessages(prev => [...prev, { role: 'ai', text: error.message || 'Network error. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editItem ? 'Edit Subject' : 'Add New Subject'}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        type="button" 
                        onClick={() => setShowChat(!showChat)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: showChat ? '#FF6B00' : 'rgba(255, 107, 0, 0.1)', 
                            color: showChat ? 'white' : '#FF6B00',
                            border: '1px solid #FF6B00',
                            padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                        }}
                    >
                        ✨ AI Helper
                    </button>
                    {editItem && <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
                </div>
            </div>
            
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (!editItem) setSlug(slugify(e.target.value));
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
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required 
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f9fa' }}
                    />
                    <button 
                        type="button" 
                        onClick={() => setSlug(slugify(name))}
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
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                    />
                    {!imageFile && (
                        <>
                            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>OR</div>
                            <input 
                                type="url" 
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Saving...' : (editItem ? 'Update Subject' : 'Create Subject')}
            </button>

            {/* AI Chat Layout (Floating or Inline) */}
            {showChat && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px',
                    background: 'white', border: '1px solid #FF6B00', borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}>
                    <div style={{ background: '#FF6B00', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>✨ AI Assistant</h3>
                        <button type="button" onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>

                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {chatMessages.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '0.8rem',
                                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                background: msg.role === 'user' ? '#FF6B00' : 'white',
                                color: msg.role === 'user' ? 'white' : '#334155',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {msg.role === 'ai' ? (
                                    <ReactMarkdown 
                                        components={{
                                            p: ({...props}) => <p style={{margin: 0, marginBottom: '0.5rem'}} {...props} />,
                                            ul: ({...props}) => <ul style={{margin: 0, paddingLeft: '1.2rem'}} {...props} />,
                                            li: ({...props}) => <li style={{marginBottom: '0.2rem'}} {...props} />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}
                        {chatLoading && (
                            <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                type="text" 
                                value={chatInput} 
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                                placeholder="Ask me anything..." 
                                style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
                            />
                            <button 
                                type="button"
                                onClick={handleSendMessage} 
                                disabled={chatLoading}
                                style={{ 
                                    background: '#FF6B00', color: 'white', border: 'none', borderRadius: '8px', 
                                    padding: '0 0.8rem', cursor: 'pointer', fontWeight: 'bold' 
                                }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default SubjectForm;
