'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { Trash2, Plus, AlertCircle, Check, X } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

interface Question {
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string;
    marks?: number;
}

interface Paper {
    _id?: string;
    title: string;
    year: number;
    stream: string;
    questions: Question[];
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
    const [stream, setStream] = useState('medical');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandQuestionForm, setExpandQuestionForm] = useState(true);

    // Current Question Editing State
    const [qText, setQText] = useState('');
    const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);
    const [qExplanation, setQExplanation] = useState('');

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setYear(editItem.year);
            setStream(editItem.stream);
            setQuestions(editItem.questions || []);
        } else {
            resetForm();
        }
    }, [editItem]);

    const resetForm = () => {
        setTitle('');
        setYear(new Date().getFullYear());
        setStream('medical');
        setQuestions([]);
        clearQuestionInput();
    };

    const clearQuestionInput = () => {
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
        setQExplanation('');
        // Keep form expanded for rapid entry
    };

    const handleAddQuestion = () => {
        if (!qText.trim() || qOptions.some(o => !o.trim())) {
            alert('Please fill out the question text and all 4 options.');
            return;
        }

        const newQuestion: Question = {
            text: qText,
            options: [...qOptions],
            correctOption: qCorrect,
            explanation: qExplanation,
            marks: 1
        };

        setQuestions([...questions, newQuestion]);
        clearQuestionInput();
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleOptionChange = (idx: number, val: string) => {
        const newOpts = [...qOptions];
        newOpts[idx] = val;
        setQOptions(newOpts);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title,
                year,
                stream,
                questions
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
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{editItem ? 'Edit Paper' : 'Add Previous Paper'}</h2>
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Back</button>
            </div>

            {/* Paper Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Paper Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="e.g. PU CET UG 2023 - Physics"
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Year</label>
                    <input 
                        type="number" 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))} 
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Stream</label>
                    <select 
                        value={stream} 
                        onChange={e => setStream(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        {['medical', 'non-medical'].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Questions Manager */}
            <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '12px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                        Add Questions <span style={{ fontSize: '0.9rem', color: '#666' }}>({questions.length} added)</span>
                    </h3>
                    <button 
                        type="button" 
                        onClick={() => setExpandQuestionForm(!expandQuestionForm)}
                        style={{ background: 'none', border: 'none', color: '#FF6B00', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {expandQuestionForm ? 'Collapse Form' : 'Expand Form'}
                    </button>
                </div>
                
                {expandQuestionForm && (
                    <div style={{ display: 'grid', gap: '1.5rem', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
                        <TiptapEditor 
                            label="Question Text"
                            value={qText}
                            onChange={setQText}
                            placeholder="Enter question text here (supports math & images)..."
                        />
                        
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <label style={{ fontWeight: 600, color: '#334155' }}>Options (Select Correct Answer)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {qOptions.map((opt, idx) => (
                                    <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: `1px solid ${qCorrect === idx ? '#22c55e' : '#e2e8f0'}`, position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>OPTION {String.fromCharCode(65 + idx)}</span>
                                            <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: qCorrect === idx ? '#16a34a' : '#64748b', fontWeight: qCorrect === idx ? 700 : 400 }}>
                                                <input 
                                                    type="radio" 
                                                    name="correctOpt"
                                                    checked={qCorrect === idx}
                                                    onChange={() => setQCorrect(idx)}
                                                    style={{ accentColor: '#22c55e' }}
                                                />
                                                Correct
                                            </label>
                                        </div>
                                        <TiptapEditor 
                                            label=""
                                            value={opt}
                                            onChange={(val) => handleOptionChange(idx, val)}
                                            placeholder={`Option ${idx + 1}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <TiptapEditor 
                            label="Explanation (Optional)"
                            value={qExplanation}
                            onChange={setQExplanation}
                            placeholder="Explain the solution..."
                        />

                        <button 
                            type="button" 
                            onClick={handleAddQuestion}
                            className="btn-primary"
                            style={{ 
                                padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                maxWidth: '200px', marginLeft: 'auto'
                            }}
                        >
                            <Plus size={18} /> Add Question
                        </button>
                    </div>
                )}

                {/* Questions List Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {questions.map((q, i) => (
                        <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, paddingRight: '1rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem', color: '#1e293b' }}>
                                    Q{i+1}: <span dangerouslySetInnerHTML={{ __html: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '') }} />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Check size={14} className="text-green-500" /> 
                                    Correct: <span dangerouslySetInnerHTML={{ __html: q.options[q.correctOption].substring(0, 50) + '...' }} />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveQuestion(i)}
                                style={{ color: '#ef4444', background: '#fef2f2', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {questions.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No questions added yet. Use the form above to add them.</p>}
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                {loading ? 'Saving Paper...' : (editItem ? 'Update Paper' : 'Create Paper')}
            </button>
        </form>
    );
};

export default PaperForm;
