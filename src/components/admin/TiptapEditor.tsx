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
    Type, Sparkles, Wand2, Minus, Eraser, Zap
} from 'lucide-react';

/* 
  PHYSICS MATH NORMALIZER & SANITIZER
  This utility detects messy physics pastes and cleans them.
*/
const sanitizePhysicsMath = (content: string) => {
    let cleaned = content;

    // 1. DEDUPLICATION: Detects patterns like [P]=ML2T-3[P] = \mathbf{ML^2T^{-3}}[P]=ML2T-3
    // It captures the LaTeX part and discards the plain-text wrappers often found on study sites.
    const latexPattern = /([\[(][A-Z][\])])\s*=\s*([A-Z0-9\-\^]+)\s*\1\s*=\s*(\\[a-z]+\{[^}]+\})\s*\1\s*=\s*\2/g;
    cleaned = cleaned.replace(latexPattern, (match, prefix, plain, latex) => {
       return `${prefix} = ${latex}`;
    });

    // 2. DIMENSIONAL ANALYSIS FIX: ML2T-2 -> ML^2T^{-2}
    // Looks for M, L, T, P followed by numbers and optionally a minus, ensuring they become superscripts.
    cleaned = cleaned.replace(/([MLTP])(\d)/g, '$1^$2'); // M2 -> M^2
    cleaned = cleaned.replace(/([MLTP])\-(\d)/g, '$1^{-$2}'); // T-3 -> T^{-3}
    cleaned = cleaned.replace(/\^(\d)([MLTP])/g, '^{$1}$2'); // Fix overlaps

    // 3. COMMON NOISE REMOVAL: Remove doubled brackets and weird artifacts
    cleaned = cleaned.replace(/\[M\]\[M\]\[M\]/g, '[M]');
    cleaned = cleaned.replace(/\[L\]\[L\]\[L\]/g, '[L]');
    
    // 4. CLEAN RAW LATEX NOISE: ML2T-2ML2T-2 pattern
    cleaned = cleaned.replace(/([A-Z\^\{\}\-]+)\1/g, '$1');

    return cleaned;
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
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: { keepAttributes: true, keepMarks: true },
            }),
            Typography,
            Underline,
            Placeholder.configure({
                placeholder: placeholder || 'Type or paste physics content here...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Link.configure({ openOnClick: false }),
            Image.configure({ HTMLAttributes: { class: 'editor-image' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData('text/plain');
                const html = event.clipboardData?.getData('text/html');

                // If content looks like messy math duplication
                if (text && (text.includes('\\mathbf') || text.includes('ML') || text.includes('='))) {
                    console.log('Sanitizing Physics Paste...');
                    const sanitizedText = sanitizePhysicsMath(text);
                    
                    // If it was HTML, we still use the sanitized text to avoid duplicating the messy layers
                    if (sanitizedText !== text) {
                        view.dispatch(view.state.tr.insertText(sanitizedText));
                        return true; 
                    }
                }
                return false;
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const performSmartClean = () => {
        if (!editor) return;
        setIsCleaning(true);
        setTimeout(() => {
            const rawText = editor.getText();
            const cleaned = sanitizePhysicsMath(rawText);
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
        width: '36px', height: '36px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isActive ? '#FF6B00' : 'transparent',
        color: isActive ? 'white' : '#64748b',
        boxShadow: isActive ? '0 4px 12px rgba(255, 107, 0, 0.3)' : 'none',
        opacity: disabled ? 0.3 : 1,
    });

    return (
        <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={12} color="#FF6B00" />
                        AI-POWERED PHYSICS EDITOR
                    </label>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Clean Content Suite</h3>
                </div>
                {isCleaning && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '10px', background: '#FF6B00', color: 'white', padding: '6px 14px', borderRadius: '100px', fontWeight: 800 }}>
                        DEDUPING MATH...
                    </motion.span>
                )}
            </div>

            <div style={{
                border: `1.5px solid ${isFocused ? '#FF6B00' : '#e2e8f0'}`,
                borderRadius: '20px', background: 'white',
                overflow: 'hidden', boxShadow: isFocused ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
            }}>
                <div style={{
                    background: '#fcfcfe', padding: '8px 12px', borderBottom: '1.5px solid #f1f5f9',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px'
                }}>
                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)}><Bold size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)}><Italic size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)}><Heading1 size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 2 }), false)}><Heading2 size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)}><List size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={toolbarButtonStyle(false, false)}><Minus size={16} /></button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)}><ImageIcon size={16} /></button>
                        <button 
                            type="button" 
                            onClick={performSmartClean}
                            style={{ ...toolbarButtonStyle(false, false), background: '#fff7ed', color: '#FF6B00', border: '1.5px solid #ffedd5' }} 
                            title="Auto-Dedup Physics Math"
                        >
                            <Eraser size={16} />
                        </button>
                    </div>

                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                    
                    <div style={{ flexGrow: 1 }} />
                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                         <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={16} /></button>
                         <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={16} /></button>
                    </div>
                </div>

                <div style={{ position: 'relative', padding: '1.5rem 2rem' }}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={10} />
                Tip: Paste messy physics math—it will be automatically cleaned and deduped.
            </p>

            <style jsx global>{`
                .ProseMirror { outline: none !important; min-height: 350px; font-family: 'Inter', sans-serif; line-height: 1.8; color: #334151; font-size: 1.05rem; }
                .ProseMirror p { margin-bottom: 1.5rem; }
                .ProseMirror h1 { font-size: 1.8rem; font-weight: 850; margin: 3rem 0 1.5rem; color: #0f172a; letter-spacing: -0.02em; }
                .ProseMirror h2 { font-size: 1.5rem; font-weight: 750; border-bottom: none !important; }
                .ProseMirror hr { border: none; border-top: 2.5px solid #f1f5f9; margin: 3rem 0; }
                .ProseMirror .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #cbd5e1; pointer-events: none; height: 0; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
