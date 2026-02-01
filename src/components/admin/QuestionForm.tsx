'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import TiptapEditor from './TiptapEditor';
import ReactMarkdown from 'react-markdown';

interface Subject {
    _id: string;
    name: string;
}

interface Chapter {
    _id: string;
    name: string;
}

interface Paper {
    _id: string;
    title: string;
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

interface QuestionFormProps {
    editItem: Question | null;
    subjects: Subject[];
    chapters: Chapter[];
    papers: Paper[]; 
    initialPaperId?: string; // New Prop
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    onCancel: () => void;
    onSubjectChange: (subjectId: string) => void;
}

const QuestionForm = ({ editItem, subjects, chapters, papers, initialPaperId, onSuccess, onError, onCancel, onSubjectChange }: QuestionFormProps) => {
    const [subjectId, setSubjectId] = useState('');
    const [chapterId, setChapterId] = useState('');
    const [paperId, setPaperId] = useState(''); 
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
            // @ts-ignore
            setPaperId(editItem.paper || '');
            setText(editItem.text || '');
            setOptions(editItem.options || ['', '', '', '']);
            setCorrectOption(editItem.correctOption ?? 0);
            setExplanation(editItem.explanation || '');
            setDifficulty(editItem.difficulty || 'medium');
        } else {
            // New entry logic
            if (initialPaperId) setPaperId(initialPaperId);

            if (subjects.length > 0 && !subjectId && !initialPaperId) {
                const firstSubId = subjects[0]._id;
                setSubjectId(firstSubId);
                onSubjectChange(firstSubId);
            }
        }
    }, [editItem, subjects, onSubjectChange, subjectId, initialPaperId]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = editItem 
                ? `/content/questions/${editItem._id}`
                : `/content/questions`;
                
            const method = editItem ? 'PUT' : 'POST';

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify({
                    subjectId: subjectId || null,
                    chapterId: chapterId || null, 
                    paperId: paperId || null,
                    text,
                    options,
                    correctOption,
                    explanation,
                    difficulty
                })
            });

            onSuccess(`Question ${editItem ? 'updated' : 'added'} successfully!`);
            if (!editItem) {
                setText('');
                setOptions(['', '', '', '']);
                setExplanation('');
            }
        } catch (err: unknown) {
            const error = err as Error;
            onError(error.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    // AI Chat State
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: 'Need help drafting a question or explanation? I can also suggest distinct distractors (wrong options)!' }
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
                    context: `Drafting Question for Subject ID: ${subjectId}. Current Text: ${text}`
                })
            });

            setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (err: unknown) {
            const error = err as Error;
            setChatMessages(prev => [...prev, { role: 'ai', text: error.message || 'Network error.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editItem ? 'Edit Question' : 'Add New Question'}</h2>
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

            <div style={{ display: 'grid', gridTemplateColumns: paperId ? '1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                {!paperId && (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Subject</label>
                            <select 
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    onSubjectChange(e.target.value);
                                }}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                <option value="">-- No Subject (General) --</option>
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
                    </>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Paper (Optional)</label>
                    <select 
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: paperId ? '#fff7ed' : 'white', borderColor: paperId ? '#FF6B00' : '#ddd' }}
                    >
                        <option value="">-- No Paper --</option>
                        {papers?.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
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

            {/* AI Chat Layout */}
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
                                            p: ({ ...props }) => <p style={{margin: 0, marginBottom: '0.5rem'}} {...props} />,
                                            ul: ({ ...props }) => <ul style={{margin: 0, paddingLeft: '1.2rem'}} {...props} />,
                                            li: ({ ...props }) => <li style={{marginBottom: '0.2rem'}} {...props} />
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

export default QuestionForm;
