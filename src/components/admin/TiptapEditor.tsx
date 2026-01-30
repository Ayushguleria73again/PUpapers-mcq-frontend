'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { 
    Bold, Italic, List, ListOrdered, Quote, 
    Underline as UnderlineIcon, ImageIcon, 
    Link as LinkIcon, Undo, Redo, Heading1, Heading2,
    Type, Sparkles, Minus, Zap, Info
} from 'lucide-react';

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label: string;
}

const TiptapEditor = ({ value, onChange, placeholder, label }: TiptapEditorProps) => {
    const [uploading, setUploading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: { keepAttributes: true, keepMarks: true },
            }),
            Typography,
            Underline,
            Markdown,
            Placeholder.configure({
                placeholder: placeholder || 'Type or paste content here...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Link.configure({ openOnClick: false }),
            Image.configure({ HTMLAttributes: { class: 'editor-image' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onChange(markdown);
            setCharCount(editor.getText().length);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
    });

    useEffect(() => {
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(value);
            setCharCount(editor.getText().length);
        }
    }, [value, editor]);

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
                editor?.chain().focus().setImage({ src: data.url }).run();
            }
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    if (!editor) return null;

    const toolbarButtonStyle = (isActive: boolean, disabled: boolean): React.CSSProperties => ({
        width: '32px', height: '32px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', transition: 'all 0.15s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isActive ? '#f1f5f9' : 'transparent',
        color: isActive ? '#FF6B00' : '#475569',
        opacity: disabled ? 0.3 : 1,
    });

    return (
        <div className="professional-editor" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={14} color="#FF6B00" />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {label}
                    </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                    Markdown Input Support
                </div>
            </div>

            <div style={{
                border: `1px solid ${isFocused ? '#FF6B00' : '#e2e8f0'}`,
                borderRadius: '12px', background: 'white',
                boxShadow: isFocused ? '0 10px 25px -5px rgba(255, 107, 0, 0.05)' : 'none',
                transition: 'all 0.2s ease', overflow: 'hidden'
            }}>
                <div style={{
                    background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)}><Bold size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)}><Italic size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={toolbarButtonStyle(editor.isActive('underline'), false)}><UnderlineIcon size={15} /></button>
                    
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 8px' }} />
                    
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)}><Heading1 size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 2 }), false)}><Heading2 size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)}><List size={15} /></button>
                    
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 8px' }} />

                    <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)} title="Insert Image"><ImageIcon size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={toolbarButtonStyle(false, false)} title="Divider"><Minus size={15} /></button>

                    <div style={{ flexGrow: 1 }} />
                    
                    <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={15} /></button>
                </div>

                <div style={{ position: 'relative', minHeight: '180px' }}>
                    <EditorContent editor={editor} style={{ padding: '1rem' }} />
                </div>

                <div style={{ 
                    padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={12} /> Rich text editor ready</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

            <style jsx global>{`
                .ProseMirror { outline: none !important; font-family: 'Inter', sans-serif; min-height: 180px; color: #1e293b; font-size: 1rem; line-height: 1.6; }
                .ProseMirror p { margin-bottom: 0.75rem; }
                .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #0f172a; }
                .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1e293b; }
                .ProseMirror .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #cbd5e1; pointer-events: none; height: 0; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
