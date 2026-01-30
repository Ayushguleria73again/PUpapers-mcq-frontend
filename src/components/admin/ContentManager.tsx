'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit } from 'lucide-react';

interface ContentManagerProps {
    subjects: any[];
    chapters: any[];
    questions: any[];
    onEdit: (type: 'subject' | 'chapter' | 'question', item: any) => void;
    onDelete: (type: 'subjects' | 'chapters' | 'questions', id: string) => void;
    onFetchQuestions: (subjectId: string, chapterId: string) => void;
    onFetchChapters: (subjectId: string) => void;
}

const ContentManager = ({ subjects, chapters, questions, onEdit, onDelete, onFetchQuestions, onFetchChapters }: ContentManagerProps) => {
    const [manageType, setManageType] = useState<'subject' | 'chapter' | 'question'>('subject');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedChapterId, setSelectedChapterId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFetchQuestions = async () => {
        setLoading(true);
        await onFetchQuestions(selectedSubjectId, selectedChapterId);
        setLoading(false);
    };

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Manage Content</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {(['subject', 'chapter', 'question'] as const).map((type) => (
                    <button 
                        key={type}
                        onClick={() => setManageType(type)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            background: manageType === type ? '#2c3e50' : '#f1f1f1',
                            color: manageType === type ? 'white' : '#333',
                            border: 'none',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {type}s
                    </button>
                ))}
            </div>

            {manageType === 'subject' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {subjects.map(sub => (
                        <div key={sub._id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img 
                                    src={sub.image || 'https://placehold.co/100x100?text=' + sub.name[0]} 
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
                                    onClick={() => onEdit('subject', sub)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => onDelete('subjects', sub._id)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#e74c3c', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {subjects.length === 0 && <p style={{ color: '#888' }}>No subjects found.</p>}
                </div>
            )}

            {manageType === 'chapter' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <select 
                        value={selectedSubjectId}
                        onChange={(e) => {
                            setSelectedSubjectId(e.target.value);
                            onFetchChapters(e.target.value);
                        }}
                        style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
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
                                    onClick={() => onEdit('chapter', chap)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => onDelete('chapters', chap._id)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#e74c3c', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
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
                            value={selectedSubjectId}
                            onChange={(e) => {
                                setSelectedSubjectId(e.target.value);
                                onFetchChapters(e.target.value);
                            }}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedChapterId}
                            onChange={(e) => setSelectedChapterId(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="">Select Chapter (Optional)</option>
                            {chapters.map(chap => (
                                <option key={chap._id} value={chap._id}>{chap.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="button"
                        onClick={handleFetchQuestions}
                        style={{ padding: '0.6rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        disabled={loading || !selectedSubjectId}
                    >
                        {loading ? 'Fetching...' : 'Fetch Questions'}
                    </button>

                    {questions.map((q: any) => (
                        <div key={q._id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ maxWidth: '80%' }}>
                                <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>
                                    <div dangerouslySetInnerHTML={{ __html: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '') }} />
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {q.subject?.name} {q.chapter && `> ${q.chapter.name}`} • {q.difficulty}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                    onClick={() => onEdit('question', q)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => onDelete('questions', q._id)}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#e74c3c', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {questions.length === 0 && <p style={{ color: '#888' }}>No questions found or fetch to see results.</p>}
                </div>
            )}
        </div>
    );
};

export default ContentManager;
