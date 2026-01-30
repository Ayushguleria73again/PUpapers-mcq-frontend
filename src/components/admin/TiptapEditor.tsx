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
    CheckCircle2, Info
} from 'lucide-react';

/* 
  PHYSICS MATH NORMALIZER & SANITIZER
  This utility detects messy physics pastes and cleans them.
*/
const sanitizePhysicsMath = (content: string) => {
    let cleaned = content;

    // 1. DEDUPLICATION: Detects patterns like [P]=ML2T-3[P] = \mathbf{ML^2T^{-3}}[P]=ML2T-3
    const latexPattern = /([\[(][A-Z][\])])\s*=\s*([A-Z0-9\-\^]+)\s*\1\s*=\s*(\\[a-z]+\{[^}]+\})\s*\1\s*=\s*\2/g;
    cleaned = cleaned.replace(latexPattern, (match, prefix, plain, latex) => {
       return `${prefix} = ${latex}`;
    });

    // 2. DIMENSIONAL ANALYSIS FIX: ML2T-2 -> ML^2T^{-2}
    cleaned = cleaned.replace(/([MLTP])(\d)/g, '$1^$2'); 
    cleaned = cleaned.replace(/([MLTP])\-(\d)/g, '$1^{-$2}');
    cleaned = cleaned.replace(/\^(\d)([MLTP])/g, '^{$1}$2'); 

    // 3. COMMON NOISE REMOVAL
    cleaned = cleaned.replace(/\[M\]\[M\]\[M\]/g, '[M]');
    cleaned = cleaned.replace(/\[L\]\[L\]\[L\]/g, '[L]');
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
                placeholder: placeholder || 'Type or paste physics content here...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Link.configure({ openOnClick: false }),
            Image.configure({ HTMLAttributes: { class: 'editor-image' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            // Output Markdown for the parent component
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onChange(markdown);
            setCharCount(editor.getText().length);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData('text/plain');
                if (text && (text.includes('\\mathbf') || text.includes('ML') || text.includes('='))) {
                    const sanitizedText = sanitizePhysicsMath(text);
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
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(value);
            setCharCount(editor.getText().length);
        }
    }, [value, editor]);

    const performSmartClean = () => {
        if (!editor) return;
        setIsCleaning(true);
        setTimeout(() => {
            const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
            const cleaned = sanitizePhysicsMath(currentMarkdown);
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
        width: '34px', height: '34px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isActive ? '#f1f5f9' : 'transparent',
        color: isActive ? '#0f172a' : '#64748b',
        opacity: disabled ? 0.3 : 1,
    });

    return (
        <div className="professional-editor-wrapper" style={{ marginBottom: '2.5rem' }}>
            {/* Header / Info Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 107, 0, 0.2)' }}>
                        <Zap size={16} color="white" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{label}</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <Sparkles size={10} /> Professional Science Editor
                        </p>
                    </div>
                </div>
                
                <AnimatePresence>
                    {isCleaning && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ 
                                fontSize: '10px', background: '#ecfdf5', color: '#059669', 
                                border: '1px solid #10b98133', padding: '4px 12px', 
                                borderRadius: '100px', fontWeight: 700, display: 'flex', 
                                alignItems: 'center', gap: '6px' 
                            }}
                        >
                            <div className="pulse-dot" />
                            SMART CLEANING...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Editor Container */}
            <div style={{
                position: 'relative',
                border: `1.5px solid ${isFocused ? '#FF6B00' : '#f1f5f9'}`,
                borderRadius: '16px',
                background: 'white',
                transition: 'all 0.3s ease',
                boxShadow: isFocused ? '0 20px 40px -12px rgba(255, 107, 0, 0.1), 0 0 0 4px rgba(255, 107, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
            }}>
                {/* Sticky Toolbar */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
                    padding: '8px 12px', borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Text Formatting Group */}
                        <div className="toolbar-group">
                            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)} title="Bold"><Bold size={16} /></button>
                            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)} title="Italic"><Italic size={16} /></button>
                            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={toolbarButtonStyle(editor.isActive('underline'), false)} title="Underline"><UnderlineIcon size={16} /></button>
                        </div>

                        <div className="toolbar-divider" />

                        {/* Structural Group */}
                        <div className="toolbar-group">
                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)} title="Heading 1"><Heading1 size={16} /></button>
                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 2 }), false)} title="Heading 2"><Heading2 size={16} /></button>
                            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)} title="List"><List size={16} /></button>
                        </div>

                        <div className="toolbar-divider" />

                        {/* Insert Group */}
                        <div className="toolbar-group">
                            <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)} title="Upload Image"><ImageIcon size={16} /></button>
                            <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={toolbarButtonStyle(false, false)} title="Divider"><Minus size={16} /></button>
                            <button 
                                type="button" 
                                onClick={performSmartClean}
                                style={{ ...toolbarButtonStyle(false, false), color: '#FF6B00' }} 
                                title="Smart Math Clean"
                            >
                                <Wand2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* History Group */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                         <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={16} /></button>
                         <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={16} /></button>
                    </div>
                </div>

                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

                {/* Editor Surface */}
                <div style={{ minHeight: '300px', cursor: 'text', padding: '1.5rem 2rem' }}>
                    <EditorContent editor={editor} />
                </div>

                {/* Footer Info */}
                <div style={{ 
                    padding: '8px 16px', borderTop: '1px solid #f8fafc', 
                    background: '#f8fafc', display: 'flex', 
                    justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Info size={12} /> Markdown Support Enabled
                        </span>
                        {charCount > 0 && <span>• {charCount} characters</span>}
                    </div>
                    {uploading && (
                        <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="loader-mini" /> uploading image...
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror { 
                    outline: none !important; 
                    min-height: 300px; 
                    font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                    line-height: 1.7; 
                    color: #1e293b; 
                    font-size: 1rem; 
                    word-wrap: break-word;
                }
                .ProseMirror p { margin-bottom: 1.25rem; }
                .ProseMirror h1 { font-size: 2rem; font-weight: 800; margin: 2rem 0 1rem; color: #020617; }
                .ProseMirror h2 { font-size: 1.5rem; font-weight: 750; margin: 1.5rem 0 0.75rem; color: #0f172a; }
                .ProseMirror blockquote { border-left: 4px solid #FF6B00; padding: 0.5rem 0 0.5rem 1.5rem; margin: 1.5rem 0; font-style: italic; color: #475569; }
                .ProseMirror img { max-width: 100%; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .ProseMirror hr { border: none; border-top: 2px solid #f1f5f9; margin: 2rem 0; }
                .ProseMirror-focused { position: relative; }
                .ProseMirror .is-editor-empty:first-child::before { 
                    content: attr(data-placeholder); 
                    float: left; 
                    color: #94a3b8; 
                    pointer-events: none; 
                    height: 0; 
                    font-weight: 400;
                }
                
                .toolbar-group { display: flex; gap: 2px; }
                .toolbar-divider { width: 1px; height: 18px; background: #e2e8f0; margin: 0 4px; }
                
                .pulse-dot {
                    width: 6px; height: 6px; background: #10b981; border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .loader-mini {
                    width: 12px; height: 12px; border: 2px solid #e2e8f0; border-top: 2px solid #64748b;
                    border-radius: 50%; animation: spin 0.8s linear infinite;
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
