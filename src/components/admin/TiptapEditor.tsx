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
    Info, Settings
} from 'lucide-react';

/**
 * PRODUCTION-GRADE MATH & PHYSICS NORMALIZER
 * Converts corrupted pastes and shorthands into clean LaTeX/Markdown.
 */
const normalizePhysicsContent = (content: string) => {
    if (!content) return content;
    let cleaned = content;

    // 1. VERTICAL CHARACTER RECONSTRUCTION (The "Vertical Stack" Fix)
    const charsToJoin = /[MLTPQ0-9\-\^−]/;
    const lines = cleaned.split('\n');
    const reconstructed: string[] = [];
    let mathBuffer = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length > 0 && line.length <= 2 && charsToJoin.test(line)) {
            mathBuffer += line;
        } else {
            if (mathBuffer) {
                if (line.startsWith('=') || line.startsWith('+') || line.startsWith('-')) {
                    mathBuffer += ' ' + line;
                } else {
                    reconstructed.push(`$$ ${mathBuffer} $$`);
                    mathBuffer = '';
                    if (line) reconstructed.push(line);
                }
            } else {
                if (line) reconstructed.push(line);
            }
        }
    }
    if (mathBuffer) reconstructed.push(`$$ ${mathBuffer} $$`);
    cleaned = reconstructed.join('\n');

    // 2. CHARACTER CONSOLIDATION: Prevents splitting of M L T by remaining spaces
    cleaned = cleaned.replace(/([MLTPQ])\s+([MLTPQ])/g, '$1$2');

    // 3. DEDUPLICATION: Detect "Sandwich" patterns
    const sandwichPattern = /([\[(][A-Z][\])])\s*=\s*([A-Z0-9\-\^\s]+)\s*\1\s*=\s*(\\[a-z]+\{[^}]+\})\s*\1\s*=\s*\2/gi;
    cleaned = cleaned.replace(sandwichPattern, (match, varName, plain, latex) => `${varName} = ${latex}`);

    // 3. EQUATION CONSOLIDATION: Merge [P] = ML2 into a single cohesive line if split
    cleaned = cleaned.replace(/\\\[(.+?)\\\]\s*=\s*([A-Z0-9\-\s]+)/g, (match, latex, plain) => {
        return `$$ ${latex.trim()} = ${plain.trim()} $$`;
    });

    // 4. LATEX CLEANUP: Remove non-functional decorators
    cleaned = cleaned.replace(/\\mathbf\{([^}]*)\}/g, '$1');
    cleaned = cleaned.replace(/\\text\{([^}]*)\}/g, '$1');

    // 5. DIMENSIONAL ANALYSIS NORMALIZATION: ML2 -> M^{2}
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, (match, variable, value) => {
        return `${variable}^{${value}}`;
    });

    // 6. SYMBOL NORMALIZATION
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                    {label}
                </label>
            </div>

            <div style={{
                border: `1.5px solid ${isFocused ? '#FF6B00' : '#e2e8f0'}`,
                borderRadius: '16px', background: 'white', overflow: 'hidden',
                boxShadow: isFocused ? '0 10px 25px -5px rgba(255, 107, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)}><Bold size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)}><Italic size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)}><Heading1 size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)}><List size={16} /></button>
                    </div>

                    <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' }} />

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)}><ImageIcon size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={16} /></button>
                    </div>
                </div>

                <div style={{ padding: '1rem', minHeight: '150px' }}>
                    <EditorContent editor={editor} />
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
