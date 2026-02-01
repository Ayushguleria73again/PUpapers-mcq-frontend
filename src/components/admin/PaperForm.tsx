'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';

interface Paper {
    _id?: string;
    title: string;
    year: number;

    stream: string[] | string; 
}

interface Subject {
    _id: string;
    name: string;
}

interface PaperFormProps {
    editItem: Paper | null;
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
    onCancel: () => void;
}

const PaperForm = ({ editItem, onSuccess, onError, onCancel }: PaperFormProps) => {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [selectedStreams, setSelectedStreams] = useState<string[]>(['medical']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setYear(editItem.year);
            // Handle migration: convert string to array if needed
            if (Array.isArray(editItem.stream)) {
                setSelectedStreams(editItem.stream);
            } else if (typeof editItem.stream === 'string') {
                setSelectedStreams([editItem.stream]);
            }
        } else {
            resetForm();
        }
    }, [editItem]);

    const resetForm = () => {
        setTitle('');
        setYear(new Date().getFullYear());
        setSelectedStreams(['medical']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title,
                year,
                stream: selectedStreams
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Streams</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {['medical', 'non-medical', 'commerce', 'arts'].map(s => {
                                const isSelected = selectedStreams.includes(s);
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                if (selectedStreams.length > 1) { // Prevent unselecting all
                                                    setSelectedStreams(prev => prev.filter(item => item !== s));
                                                }
                                            } else {
                                                setSelectedStreams(prev => [...prev, s]);
                                            }
                                        }}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '20px',
                                            border: isSelected ? '1px solid #FF6B00' : '1px solid #cbd5e1',
                                            background: isSelected ? '#fff7ed' : 'white',
                                            color: isSelected ? '#FF6B00' : '#64748b',
                                            fontSize: '0.9rem',
                                            fontWeight: isSelected ? 600 : 400,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                {loading ? 'Saving...' : (editItem ? 'Update Paper Details' : 'Create Paper')}
            </button>
        </form>
    );
};

export default PaperForm;
