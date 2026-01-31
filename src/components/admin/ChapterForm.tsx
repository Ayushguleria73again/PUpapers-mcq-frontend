'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';

interface Subject {
    _id: string;
    name: string;
    slug: string;
}

interface Chapter {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    subject: string | Subject;
}

interface ChapterFormProps {
    editItem: Chapter | null;
    subjects: Subject[];
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    onCancel: () => void;
    refreshChapters: (subjectId: string) => void;
}

const ChapterForm = ({ editItem, subjects, onSuccess, onError, onCancel, refreshChapters }: ChapterFormProps) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setName(editItem.name || '');
            setSlug(editItem.slug || '');
            setDescription(editItem.description || '');
            const subId = typeof editItem.subject === 'string' 
                ? editItem.subject 
                : (editItem.subject as Subject)._id;
            setSubjectId(subId);
        } else {
            setName('');
            setSlug('');
            setDescription('');
            if (subjects.length > 0 && !subjectId) {
                setSubjectId(subjects[0]._id);
            }
        }
    }, [editItem, subjects]);

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
            const endpoint = editItem 
                ? `/content/chapters/${editItem._id}`
                : `/content/chapters`;
            
            const method = editItem ? 'PUT' : 'POST';

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify({
                    name,
                    slug,
                    subjectId,
                    description
                })
            });

            onSuccess(`Chapter ${editItem ? 'updated' : 'created'} successfully!`);
            if (!editItem) {
                setName(''); setSlug(''); setDescription('');
            }
            refreshChapters(subjectId);
        } catch (err: unknown) {
            const error = err as Error;
            onError(error.message || 'Failed to save chapter');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editItem ? 'Edit Chapter' : 'Add New Chapter'}</h2>
                {editItem && <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
            </div>
            
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Subject</label>
                <select 
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                    <option value="" disabled>Select a subject</option>
                    {subjects.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Chapter Name</label>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Saving...' : (editItem ? 'Update Chapter' : 'Create Chapter')}
            </button>
        </form>
    );
};

export default ChapterForm;
