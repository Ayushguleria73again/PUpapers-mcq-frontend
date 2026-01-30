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
    Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
    ImageIcon, Link as LinkIcon, Undo, Redo, Heading1, Heading2,
    Type, Sparkles, Wand2, Minus, Eraser, Zap, Maximize2, Minimize2,
    CheckCircle2, Info, FileJson, Layers
} from 'lucide-react';

/**
 * PRODUCTION-GRADE PHYSICS MATH SANITIZER
 * Developed by Senior Engineer for IIT/Scientific Content.
 */
const advancedSanitize = (content: string) => {
    if (!content) return content;
    let cleaned = content;

    // 1. Study Site triplication pattern (Toppr/Brainly/Doubtnut)
    // pattern: [V]=ABC [V]=LaTeX [V]=ABC
    const sandwichPattern = /([\[(][A-Z][\])])\s*=\s*([A-Z0-9\-\^\s]+)\s*\1\s*=\s*(\\[a-z]+\{[^}]+\})\s*\1\s*=\s*\2/gi;
    cleaned = cleaned.replace(sandwichPattern, (match, variable, plain, latex) => `${variable} = ${latex}`);

    // 2. Dimensional Analysis Normalization (IIT Standards)
    // M1L2T-3 -> M^{1}L^{2}T^{-3}
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, (match, variable, value) => {
        return `${variable}^{${value}}`;
    });

    // 3. Spacing and Brackets Cleanup
    cleaned = cleaned.replace(/\[([MLT])\]\[([MLT])\]/g, '$1$2'); // [M][L] -> ML
    cleaned = cleaned.replace(/([\d])([MLT])/g, '$1 $2'); // 3ML -> 3 ML

    // 4. Duplicate Word Cleanup (Sites often double up options)
    // "Option A Option A" -> "Option A"
    cleaned = cleaned.replace(/\b(\w+)\s+\1\b/g, '$1');

    return cleaned.trim();
};

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label: string;
}

const TiptapEditor = ({ value, onChange, placeholder, label }: TiptapEditorProps) => {
    const [uploading, setUploading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: { keepAttributes: true, keepMarks: true },
                codeBlock: false,
            }),
            Typography,
            Underline,
            Markdown,
            Placeholder.configure({
                placeholder: placeholder || 'Paste math content here (Auto-cleanup enabled)...',
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
        editorProps: {
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData('text/plain');
                if (text && (text.includes('\\') || text.includes('ML') || text.includes('='))) {
                    console.log('Senior Sanitizer Active...');
                    const sanitized = advancedSanitize(text);
                    if (sanitized !== text) {
                        view.dispatch(view.state.tr.insertText(sanitized));
                        return true; 
                    }
                }
                return false;
            },
        },
    });

    useEffect(() => {
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(value);
            setCharCount(editor.getText().length);
        }
    }, [value, editor]);

    const performDeepClean = () => {
        if (!editor) return;
        setIsCleaning(true);
        setTimeout(() => {
            const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
            const cleaned = advancedSanitize(currentMarkdown);
            editor.commands.setContent(cleaned);
            setIsCleaning(false);
        }, 800);
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
        <div className="math-editor-pro" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00', boxShadow: '0 0 8px #FF6B00' }} />
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            {label}
                        </span>
                    </div>
                </div>
                
                <AnimatePresence>
                    {isCleaning && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ 
                                fontSize: '10px', background: '#020617', color: 'white', 
                                padding: '4px 12px', borderRadius: '6px', fontWeight: 700, 
                                display: 'flex', alignItems: 'center', gap: '8px' 
                            }}
                        >
                            <Sparkles size={12} className="spinning" />
                            RECONSTRUCTING MATH...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{
                border: `1px solid ${isFocused ? '#FF6B00' : '#e2e8f0'}`,
                borderRadius: '12px', background: 'white',
                boxShadow: isFocused ? '0 10px 25px -5px rgba(255, 107, 0, 0.1)' : 'none',
                transition: 'all 0.2s ease', overflow: 'hidden'
            }}>
                <div style={{
                    background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)}><Bold size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)}><Italic size={15} /></button>
                    
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />
                    
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)}><Heading1 size={15} /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)}><List size={15} /></button>
                    
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

                    <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)}><ImageIcon size={15} /></button>
                    <button 
                        type="button" 
                        onClick={performDeepClean}
                        style={{ ...toolbarButtonStyle(false, false), background: '#fff7ed', color: '#FF6B00' }} 
                        title="Deep Normalize Math"
                    >
                        <Wand2 size={15} />
                    </button>

                    <div style={{ flexGrow: 1 }} />
                    
                    <div style={{ display: 'flex', gap: '2px' }}>
                         <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={15} /></button>
                         <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={15} /></button>
                    </div>
                </div>

                <div style={{ position: 'relative', minHeight: '150px' }}>
                    <EditorContent editor={editor} style={{ padding: '1rem' }} />
                </div>

                <div style={{ 
                    padding: '6px 12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={12} /> LaTeX Normalization Active</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

            <style jsx global>{`
                .ProseMirror { outline: none !important; font-family: 'Inter', sans-serif; min-height: 150px; color: #1e293b; font-size: 0.95rem; }
                .ProseMirror p { margin-bottom: 0.75rem; }
                .ProseMirror-focused { position: relative; }
                .ProseMirror .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #cbd5e1; pointer-events: none; height: 0; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spinning { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
