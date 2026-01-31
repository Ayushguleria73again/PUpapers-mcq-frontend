'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { apiFetch } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { 
    Bold, Italic, List, ImageIcon, 
    Undo, Redo, Heading1 
} from 'lucide-react';

/**
 * PRODUCTION-GRADE MATH & PHYSICS NORMALIZER
 * Converts corrupted pastes and shorthands into clean LaTeX/Markdown.
 */
const normalizePhysicsContent = (content: string) => {
    if (!content) return content;
    let cleaned = content;

    // 1. AGGRESSIVE VERTICAL RECONSTRUCTION + REDUNDANCY GUARD
    const lines = cleaned.split('\n');
    const reconstructed: string[] = [];
    let buffer = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const nextLine = (lines[i + 1] || '').trim();

        if (line.length > 0 && line.length <= 2) {
            buffer += line;
        } else {
            if (buffer) {
                const cleanBuffer = buffer.replace(/[\s\$\(\)]/g, '');
                const cleanNext = nextLine.replace(/[\s\$\(\)]/g, '');
                
                if (!cleanNext.startsWith(cleanBuffer) || cleanBuffer.length < 2) {
                    const isMath = /[\d\+\-\=\^×\\$\(\)]/.test(buffer) || /[MLTPQ]/.test(buffer);
                    if (isMath) reconstructed.push(`$$ ${buffer} $$`);
                    else reconstructed.push(buffer);
                }
                buffer = '';
            }
            if (line) reconstructed.push(line);
        }
    }
    if (buffer) reconstructed.push(buffer);
    cleaned = reconstructed.join('\n');

    // 2. FUZZY SHADOW DEDUPLICATION (Fixes "powermower")
    cleaned = cleaned.split('\n').map(line => {
        const text = line.trim();
        if (text.length < 4) return line;
        const mid = Math.floor(text.length / 2);
        const first = text.substring(0, mid).trim();
        const second = text.substring(mid).trim();
        if (first === second || first.replace(/\s/g, '') === second.replace(/\s/g, '')) return first;
        return line;
    }).join('\n');

    // 3. DEDUPLICATION: Detect "Sandwich" patterns
    const sandwichPattern = /([\[(][A-Z][\])])\s*=\s*([A-Z0-9\-\^\s]+)\s*\1\s*=\s*(\\[a-z]+\{[^}]+\})\s*\1\s*=\s*\2/gi;
    cleaned = cleaned.replace(sandwichPattern, (match, varName, plain, latex) => `${varName} = ${latex}`);

    // 4. DIMENSIONAL ANALYSIS NORMALIZATION: ML2 -> M^{2}
    cleaned = cleaned.replace(/([MLTPQ])(\-?\d+)/g, '$1^{$2}');

    // 5. SYMBOL NORMALIZATION
    cleaned = cleaned.replace(/−/g, '-');
    cleaned = cleaned.replace(/×/g, '\\times');
    cleaned = cleaned.replace(/([MLTPQ])\s+([MLTPQ])/g, '$1$2');

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
            Markdown.configure({
                html: true,
                tightLists: true,
                bulletListMarker: '-',
            }),
            Typography,
            Placeholder.configure({
                placeholder: placeholder || 'Paste physics explanation here...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
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
        // Only sync from value to editor if NOT focused AND NOT cleaning
        // This is CRITICAL to prevent state-reset races during batch uploads
        if (editor && !editor.isFocused && !isCleaning) {
            const currentMarkdown = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
            if (value !== currentMarkdown) {
                console.log('[Tiptap] External sync triggered');
                editor.commands.setContent(value);
            }
        }
    }, [value, editor, isCleaning]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !editor) return;

        console.log(`[Tiptap] Batch upload started: ${files.length} files`);
        setIsCleaning(true);
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('image', file);

                const data = await apiFetch<{ url: string }>('/content/upload', {
                    method: 'POST',
                    body: formData,
                });
                console.log(`[Tiptap] Uploaded ${i + 1}/${files.length}: ${data.url}`);
                    
                    // Use more robust insertion: append image + newline
                    editor.chain()
                        .focus()
                        .insertContent([
                            { type: 'image', attrs: { src: data.url } },
                        ])
                    .run();
            }
        } catch (err) {
            console.error('[Tiptap] Upload error:', err);
        } finally {
            console.log('[Tiptap] Batch upload complete');
            setIsCleaning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
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
                <div style={{ background: '#ffffff', padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)}><Bold size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)}><Italic size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)}><Heading1 size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)}><List size={16} /></button>
                    </div>

                    <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' }} />

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, isCleaning)} disabled={isCleaning}>
                            <ImageIcon size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            multiple
                            style={{ display: 'none' }} 
                        />
                        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())}><Undo size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())}><Redo size={16} /></button>
                    </div>
                </div>

                <div style={{ padding: '1rem', minHeight: '150px', position: 'relative' }}>
                    <AnimatePresence>
                        {isCleaning && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', inset: 0, zIndex: 10,
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(2px)', fontWeight: 600, color: '#FF6B00',
                                    gap: '10px'
                                }}
                            >
                                <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid #f3f3f3', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                Processing Uploads...
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <EditorContent editor={editor} />
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror { outline: none !important; min-height: 200px; font-family: 'Inter', sans-serif; font-size: 1.05rem; line-height: 1.7; color: #334155; }
                .ProseMirror p { margin-bottom: 1rem; }
                .ProseMirror h1 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 1.5rem 0 1rem; }
                .ProseMirror    .is-editor-empty:before {
        content: attr(data-placeholder);
        float: left;
        color: #adb5bd;
        pointer-events: none;
        height: 0;
    }

    .editor-image {
        max-width: 100%;
        max-height: 250px;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        display: block;
        margin: 1rem auto;
        border: 1px solid #e2e8f0;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
