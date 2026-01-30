'use client';

import React, { useState, useEffect } from 'react';
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



// ... (existing imports)

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    message: userMsg,
                    context: `Drafting Question for Subject ID: ${subjectId}. Current Text: ${text}`
                })
            });

            if (res.ok) {
                const data = await res.json();
                setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'ai', text: 'Error interacting with AI.' }]);
            }
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'ai', text: 'Network error.' }]);
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

            {/* ... (rest of the form fields) */}

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
                                            p: ({node, ...props}: any) => <p style={{margin: 0, marginBottom: '0.5rem'}} {...props} />,
                                            ul: ({node, ...props}: any) => <ul style={{margin: 0, paddingLeft: '1.2rem'}} {...props} />,
                                            li: ({node, ...props}: any) => <li style={{marginBottom: '0.2rem'}} {...props} />
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e as any)}
                                placeholder="Ask me anything..." 
                                style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
                            />
                            <button 
                                type="button"
                                onClick={handleSendMessage as any} 
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
