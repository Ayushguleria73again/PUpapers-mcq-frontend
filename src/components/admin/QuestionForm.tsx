'use client';

import React, { useState, useEffect } from 'react';
import TiptapEditor from './TiptapEditor';

interface Subject {
    _id: string;
    name: string;
}

interface Chapter {
    _id: string;
    name: string;
}

interface Question {
    _id: string;
    text: string;
    options: string[];
    correctOption: number;
    explanation?: string;
    difficulty: string;
    subject: string | any;
    chapter?: string | any;
}

interface QuestionFormProps {
    editItem: Question | null;
    subjects: Subject[];
    chapters: Chapter[];
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    onCancel: () => void;
    onSubjectChange: (subjectId: string) => void;
}

const QuestionForm = ({ editItem, subjects, chapters, onSuccess, onError, onCancel, onSubjectChange }: QuestionFormProps) => {
    const [subjectId, setSubjectId] = useState('');
    const [chapterId, setChapterId] = useState('');
    const [text, setText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOption, setCorrectOption] = useState(0);
    const [explanation, setExplanation] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setSubjectId(typeof editItem.subject === 'string' ? editItem.subject : editItem.subject?._id || '');
            setChapterId(typeof editItem.chapter === 'string' ? editItem.chapter : editItem.chapter?._id || '');
            setText(editItem.text || '');
            setOptions(editItem.options || ['', '', '', '']);
            setCorrectOption(editItem.correctOption ?? 0);
            setExplanation(editItem.explanation || '');
            setDifficulty(editItem.difficulty || 'medium');
        } else {
            if (subjects.length > 0 && !subjectId) {
                const firstSubId = subjects[0]._id;
                setSubjectId(firstSubId);
                onSubjectChange(firstSubId);
            }
        }
    }, [editItem, subjects]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editItem 
                ? `${process.env.NEXT_PUBLIC_API_URL}/content/questions/${editItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/content/questions`;
                
            const method = editItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    subjectId,
                    chapterId: chapterId || null, 
                    text,
                    options,
                    correctOption,
                    explanation,
                    difficulty
                })
            });

            if (res.ok) {
                onSuccess(`Question ${editItem ? 'updated' : 'added'} successfully!`);
                if (!editItem) {
                    setText('');
                    setOptions(['', '', '', '']);
                    setExplanation('');
                }
            } else {
                const data = await res.json();
                onError(data.message || 'Failed to save question');
            }
        } catch (err) {
            onError('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editItem ? 'Edit Question' : 'Add New Question'}</h2>
                {editItem && <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Subject</label>
                    <select 
                        value={subjectId}
                        onChange={(e) => {
                            setSubjectId(e.target.value);
                            onSubjectChange(e.target.value);
                        }}
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
                        value={chapterId}
                        onChange={(e) => setChapterId(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        <option value="">-- No Chapter --</option>
                        {chapters.map(chap => (
                            <option key={chap._id} value={chap._id}>{chap.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <TiptapEditor 
                label="Question Text"
                value={text}
                onChange={setText}
                placeholder="Enter your question here..."
            />

            <div>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: '#2c3e50' }}>Multiple Choice Options</label>
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                    {options.map((opt, idx) => (
                        <div key={idx} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#666' }}>OPTION {String.fromCharCode(65 + idx)}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input 
                                            type="radio" 
                                            name="correctOption"
                                            checked={correctOption === idx}
                                            onChange={() => setCorrectOption(idx)}
                                            style={{ width: '16px', height: '16px', accentColor: '#2ecc71' }}
                                        />
                                        Correct Answer
                                    </label>
                                </div>
                            </div>
                            <TiptapEditor 
                                label="" 
                                value={opt} 
                                onChange={(val) => handleOptionChange(idx, val)} 
                                placeholder={`Enter option ${String.fromCharCode(65 + idx)}...`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <TiptapEditor 
                label="Explanation"
                value={explanation}
                onChange={setExplanation}
                placeholder="Explain why the correct answer is right..."
            />

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Difficulty</label>
                <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Saving...' : (editItem ? 'Update Question' : 'Add Question')}
            </button>
        </form>
    );
};

export default QuestionForm;
