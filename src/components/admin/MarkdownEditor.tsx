'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, List, ImageIcon, Link as LinkIcon, Eye, Code } from 'lucide-react';

import remarkBreaks from 'remark-breaks';

interface MarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label: string;
}

const MarkdownEditor = ({ value, onChange, placeholder, label }: MarkdownEditorProps) => {
    const [isPreview, setIsPreview] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const newValue = text.substring(0, start) + before + selected + after + text.substring(end);
        onChange(newValue);
        
        // Refocus and set cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length + (selected ? selected.length : 0));
        }, 0);
    };

    const uploadFile = async (file: File) => {
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
                insertText(`\n![image](${data.url})\n`);
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Server error during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    await uploadFile(file);
                }
            }
        }
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 500, color: '#444' }}>{label}</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {uploading && <span style={{ fontSize: '0.75rem', color: '#FF6B00' }}>Uploading...</span>}
                    <button 
                        type="button" 
                        onClick={() => setIsPreview(!isPreview)}
                        style={{ fontSize: '0.8rem', color: '#FF6B00', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                        {isPreview ? <Code size={14} /> : <Eye size={14} />} {isPreview ? 'Switch to Editor' : 'Live Preview'}
                    </button>
                </div>
            </div>

            {!isPreview ? (
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
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
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onPaste={handlePaste}
                        placeholder={placeholder}
                        rows={6}
                        style={{ width: '100%', padding: '1rem', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: '0.95rem', minHeight: '150px', resize: 'vertical' }}
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
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{value || '*No content to preview*'}</ReactMarkdown>
                </div>
            )}
            <style>{`
                .markdown-preview img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
                .markdown-preview ul, .markdown-preview ol { padding-left: 1.5rem; margin: 10px 0; }
                .markdown-preview p { margin: 10px 0; }
                .markdown-preview a { color: #FF6B00; text-decoration: underline; }
                .markdown-preview blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; font-style: italic; }
            `}</style>
        </div>
    );
};

export default MarkdownEditor;
