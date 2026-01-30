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
    Undo, Redo, Heading1, Heading2,
    Zap, Info, Sparkles, Wand2
} from 'lucide-react';

/**
 * PRODUCTION-GRADE MATH & PHYSICS NORMALIZER
 * Converts corrupted pastes and shorthands into clean LaTeX/Markdown.
 */
const normalizePhysicsContent = (content: string) => {
    if (!content) return content;
    let cleaned = content;

    // 1. DEDUPLICATION: Detect "Sandwich" patterns (Visual = LaTeX = Visual)
    // Example: [P]=ML2[P]=\mathbf{ML^2}[P]=ML2
    const sandwichPattern = /([\[(][A-Z][\])])\s*=\s*([A-Z0-9\-\^\s]+)\s*\1\s*=\s*(\\[a-z]+\{[^}]+\})\s*\1\s*=\s*\2/gi;
    cleaned = cleaned.replace(sandwichPattern, (match, varName, plain, latex) => `${varName} = ${latex}`);

    // 2. LATEX CLEANUP: Remove non-functional math decorators that cause KaTeX errors
    cleaned = cleaned.replace(/\\mathbf\{([^}]*)\}/g, '$1'); // Remove \mathbf{} but keep content
    cleaned = cleaned.replace(/\\text\{([^}]*)\}/g, '$1');   // Remove \text{} but keep content

    // 3. DIMENSIONAL ANALYSIS NORMALIZATION: ML2 -> M^{2}, T-3 -> T^{-3}
    // Matches M, L, T, P, Q followed by digits (opt +/-)
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, (match, variable, value) => {
        return `${variable}^{${value}}`;
    });

    // 4. CHARACTER NORMALIZATION
    cleaned = cleaned.replace(/−/g, '-'); // Mathematical minus -> standard hyphen for LaTeX
    cleaned = cleaned.replace(/×/g, '\\times'); // Multiplier symbol
    
    // 5. NOISE REMOVAL: Sites often double up content when JS isn't fully loaded
    cleaned = cleaned.replace(/\[([MLT])\]\[([MLT])\]/g, '$1$2'); // [M][L] -> ML

    return cleaned.trim();
};

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label: string;
}

const TiptapEditor = ({ value, onChange, placeholder, label }: TiptapEditorProps) => {
    const [isCleaning, setIsCleaning] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
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
                placeholder: placeholder || 'Paste physics explanation here...',
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
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData('text/plain');
                // Regex to check if content looks like corrupted math
                if (text && (text.includes('\\') || text.includes('ML') || text.includes('='))) {
                    const sanitized = normalizePhysicsContent(text);
                    if (sanitized !== text) {
                        view.dispatch(view.state.tr.insertText(sanitized));
                        return true; // Prevent default paste
                    }
                }
                return false;
            },
        },
    });

    useEffect(() => {
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const handleDeepClean = () => {
        if (!editor) return;
        setIsCleaning(true);
        setTimeout(() => {
            const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
            const cleaned = normalizePhysicsContent(currentMarkdown);
            editor.commands.setContent(cleaned);
            setIsCleaning(false);
        }, 600);
    };

    if (!editor) return null;

    const toolbarButtonStyle = (isActive: boolean, disabled: boolean): React.CSSProperties => ({
        width: '32px', height: '32px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isActive ? '#f1f5f9' : 'transparent',
        color: isActive ? '#FF6B00' : '#64748b',
        opacity: disabled ? 0.3 : 1,
    });

    return (
        <div className="math-editor-container" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '4px', background: '#fff7ed', borderRadius: '6px' }}>
                            <Zap size={14} color="#FF6B00" />
                        </div>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {label}
                        </label>
                    </div>
                </div>
                
                <AnimatePresence>
                    {isCleaning && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{ fontSize: '10px', background: '#0f172a', color: 'white', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={12} /> CLEANING MATH...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{
                border: `1.5px solid ${isFocused ? '#FF6B00' : '#e2e8f0'}`,
                borderRadius: '16px', background: 'white', overflow: 'hidden',
                boxShadow: isFocused ? '0 10px 25px -5px rgba(255, 107, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    <div className="toolbar-segment" style={{ display: 'flex', gap: '2px', background: 'white', padding: '2px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)}><Bold size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)}><Italic size={16} /></button>
                    </div>

                    <div className="toolbar-segment" style={{ display: 'flex', gap: '2px', background: 'white', padding: '2px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)}><Heading1 size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)}><List size={16} /></button>
                    </div>

                    <div className="toolbar-segment" style={{ display: 'flex', gap: '2px', background: 'white', padding: '2px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={handleDeepClean} style={{ ...toolbarButtonStyle(false, false), color: '#FF6B00' }} title="Smart Fix Math"><Wand2 size={16} /></button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)}><ImageIcon size={16} /></button>
                    </div>

                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                             // Mock upload or handle as needed
                        }
                    }} />

                    <div style={{ flexGrow: 1 }} />
                    
                    <div className="toolbar-segment" style={{ display: 'flex', gap: '2px', background: 'white', padding: '2px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={16} /></button>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', minHeight: '200px' }}>
                    <EditorContent editor={editor} />
                </div>
                
                <div style={{ padding: '8px 16px', borderTop: '1px solid #f8fafc', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                        <Info size={12} /> Auto-sanitization active
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror { outline: none !important; min-height: 200px; font-family: 'Inter', sans-serif; font-size: 1.05rem; line-height: 1.7; color: #334155; }
                .ProseMirror p { margin-bottom: 1rem; }
                .ProseMirror h1 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 1.5rem 0 1rem; }
                .ProseMirror .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #cbd5e1; pointer-events: none; height: 0; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
