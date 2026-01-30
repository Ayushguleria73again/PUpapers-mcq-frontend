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
    Type, Sparkles, Wand2, Minus, Eraser, ClipboardPaste
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
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                code: { HTMLAttributes: { class: 'math-code' } },
                bulletList: { keepAttributes: true, keepMarks: true },
                orderedList: { keepAttributes: true, keepMarks: true },
            }),
            Typography, // Auto-converts symbols like -> to → and 1/2 to ½
            Markdown.configure({
                html: true,
                tightLists: true,
                bulletListMarker: '-',
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Type or paste your content here...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'editor-link' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'editor-image' },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            handlePaste: (view, event) => {
                const html = event.clipboardData?.getData('text/html');
                const items = event.clipboardData?.items;

                // Priority 1: Handle Images
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            if (file) {
                                uploadFile(file);
                                return true;
                            }
                        }
                    }
                }

                // Priority 2: If HTML is available, let Tiptap handle the rich paste
                // This ensures "Simple Text" with bold/italics from Word/Web is kept
                if (html) {
                    return false; // Let default handler handle rich HTML
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
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addLink = useCallback(() => {
        if (editor?.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        const url = window.prompt('Enter URL');
        if (url) {
            editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    const toolbarButtonStyle = (isActive: boolean, disabled: boolean): React.CSSProperties => ({
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
                        <Wand2 size={12} color="#FF6B00" />
                        {label.toUpperCase()} EDITOR
                    </label>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Smart Editor</h3>
                </div>
                <AnimatePresence>
                    {uploading && (
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            style={{ fontSize: '10px', background: '#FF6B00', color: 'white', padding: '4px 12px', borderRadius: '100px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(255,107,0,0.2)' }}
                        >
                            <Sparkles size={10} />
                            UPLOADING...
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div style={{
                border: `1.5px solid ${isFocused ? '#FF6B00' : '#e2e8f0'}`,
                borderRadius: '20px',
                background: 'white',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: isFocused ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
            }}>
                <div style={{
                    background: '#fcfcfe',
                    padding: '8px 12px',
                    borderBottom: '1.5px solid #f1f5f9',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)} title="Bold"><Bold size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)} title="Italic"><Italic size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={toolbarButtonStyle(editor.isActive('underline'), false)} title="Underline"><UnderlineIcon size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)} title="Step Heading"><Heading1 size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 2 }), false)} title="Sub-heading"><Heading2 size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)} title="List"><List size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={toolbarButtonStyle(editor.isActive('orderedList'), false)} title="Number List"><ListOrdered size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={toolbarButtonStyle(false, false)} title="Divider"><Minus size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={addLink} style={toolbarButtonStyle(editor.isActive('link'), false)} title="Link"><LinkIcon size={16} /></button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)} title="Image"><ImageIcon size={16} /></button>
                        <button type="button" onClick={() => {
                            if (window.confirm('This will clean duplicate text and fix formatting. Continue?')) {
                                editor.chain().focus().clearContent().insertContent(editor.getText()).run();
                            }
                        }} style={toolbarButtonStyle(false, false)} title="Smart Clean Content"><Eraser size={16} /></button>
                    </div>

                    <div style={{ flexGrow: 1 }} />

                    <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '3px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())} title="Undo"><Undo size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())} title="Redo"><Redo size={16} /></button>
                    </div>
                </div>

                <div style={{ position: 'relative', padding: '1.5rem 2rem' }}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
                <ClipboardPaste size={12} color="#94a3b8" />
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                    Paste from any source—the editor will automatically keep formatting and fix "Step" styles.
                </p>
            </div>

            <style jsx global>{`
                .ProseMirror {
                    outline: none !important;
                    min-height: 350px;
                    font-family: 'Inter', system-ui, sans-serif;
                    line-height: 1.8;
                    color: #334155;
                    font-size: 1.05rem;
                }
                .ProseMirror p { margin-bottom: 1.5rem; }
                .ProseMirror h1 { font-size: 1.75rem; font-weight: 800; margin: 2rem 0 1rem; color: #0f172a; letter-spacing: -0.02em; }
                .ProseMirror h2 { font-size: 1.4rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #1e293b; }
                .ProseMirror blockquote {
                    border-left: 4px solid #FF6B00;
                    background: #fffaf5;
                    margin: 1.5rem 0;
                    padding: 1rem 1.5rem;
                    border-radius: 0 12px 12px 0;
                    font-style: italic;
                }
                .ProseMirror hr { border: none; border-top: 2px solid #f1f5f9; margin: 2.5rem 0; }
                .ProseMirror .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #cbd5e1;
                    pointer-events: none;
                    height: 0;
                }
                .editor-link { color: #FF6B00; text-decoration: underline; }
                .math-code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; color: #64748b; font-family: monospace; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
