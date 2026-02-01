'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';

interface Paper {
    _id?: string;
    title: string;
    year: number;
    stream: string;
    subject?: string;
}

interface Subject {
    _id: string;
    name: string;
}

interface PaperFormProps {
    editItem: Paper | null;
    subjects: Subject[];
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
    onCancel: () => void;
}

const PaperForm = ({ editItem, subjects, onSuccess, onError, onCancel }: PaperFormProps) => {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [stream, setStream] = useState('medical');
    const [subjectId, setSubjectId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setYear(editItem.year);
            setStream(editItem.stream);
            // Handle subject population logic if strictly needed, usually it's an ID or object
            if (editItem.subject) {
                 // If it's fully populated (object), use _id, else use string
                 setSubjectId(typeof editItem.subject === 'object' ? (editItem.subject as any)._id : editItem.subject);
            }
        } else {
            resetForm();
        }
    }, [editItem]);

    const resetForm = () => {
        setTitle('');
        setYear(new Date().getFullYear());
        setStream('medical');
        setSubjectId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title,
                year,
                stream,
                subject: subjectId || null
            };

            const endpoint = editItem 
                ? `/content/papers/${editItem._id}`
                : `/content/papers`;
            
            const method = editItem ? 'PUT' : 'POST';

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            onSuccess(editItem ? 'Paper updated successfully' : 'Paper created successfully');
            if(!editItem) resetForm();
            onCancel();
        } catch (err: unknown) {
             const error = err as Error;
            onError(error.message || 'Failed to save paper');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{editItem ? 'Edit Paper' : 'Add New Paper Subject'}</h2>
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Back</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gap: '1.5rem' }}>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Paper Title / Name</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="e.g. PU CET 2024 Physics"
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Year</label>
                        <input 
                            type="number" 
                            value={year} 
                            onChange={e => setYear(Number(e.target.value))} 
                            required
                            min="2000"
                            max="2030"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Stream</label>
                        <select 
                            value={stream} 
                            onChange={e => setStream(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        >
                            {['medical', 'non-medical', 'commerce', 'arts'].map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Subject (Optional)</label>
                    <select 
                        value={subjectId} 
                        onChange={e => setSubjectId(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name} ({s._id.slice(-4)})</option>
                        ))}
                    </select>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Linking a subject helps in filtering and organization.</p>
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                {loading ? 'Saving...' : (editItem ? 'Update Paper Details' : 'Create Paper')}
            </button>
        </form>
    );
};

export default PaperForm;
