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
import { Markdown } from 'tiptap-markdown';
import { 
    Bold, Italic, List, ListOrdered, Quote, 
    Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
    ImageIcon, Link as LinkIcon, Undo, Redo, Heading1, Heading2,
    Type, Sparkles, Wand2
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
            }),
            Markdown.configure({
                html: true, // Allow HTML tags within Markdown for compatibility
                tightLists: true,
                bulletListMarker: '-',
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something amazing...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'editor-link',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value, // Tiptap naturally handles HTML or Markdown if configured
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onChange(markdown);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
    });

    // Sync content when value changes externally
    useEffect(() => {
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
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
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isActive ? 'linear-gradient(135deg, #FF6B00 0%, #FF8E3C 100%)' : 'transparent',
        color: isActive ? 'white' : '#64748b',
        boxShadow: isActive ? '0 4px 12px rgba(255, 107, 0, 0.25)' : 'none',
        opacity: disabled ? 0.3 : 1,
    });

    return (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Wand2 size={12} color="#FF6B00" />
                        {label.toUpperCase()} CONTENT
                    </label>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Rich Text Editor</h3>
                </div>
                <AnimatePresence>
                    {uploading && (
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{ fontSize: '11px', background: '#fff7ed', color: '#ea580c', padding: '6px 12px', borderRadius: '100px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #ffedd5' }}
                        >
                            <Sparkles size={12} className="animate-pulse" />
                            UPLOADING...
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div style={{
                border: `2px solid ${isFocused ? '#FF6B00' : '#f1f5f9'}`,
                borderRadius: '24px',
                background: 'white',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isFocused ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                transform: isFocused ? 'scale(1.005)' : 'scale(1)',
            }}>
                {/* Fixed Toolbar with CSS Layout */}
                <div style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderBottom: '2px solid #f1f5f9',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle(editor.isActive('bold'), false)} title="Bold"><Bold size={18} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle(editor.isActive('italic'), false)} title="Italic"><Italic size={18} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={toolbarButtonStyle(editor.isActive('underline'), false)} title="Underline"><UnderlineIcon size={18} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }), false)} title="H1"><Heading1 size={18} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={toolbarButtonStyle(editor.isActive('heading', { level: 2 }), false)} title="H2"><Heading2 size={18} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={toolbarButtonStyle(editor.isActive('bulletList'), false)} title="List"><List size={18} /></button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={toolbarButtonStyle(editor.isActive('blockquote'), false)} title="Quote"><Quote size={18} /></button>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} style={toolbarButtonStyle(editor.isActive({ textAlign: 'center' }), false)} title="Center"><AlignCenter size={18} /></button>
                        <button type="button" onClick={addLink} style={toolbarButtonStyle(editor.isActive('link'), false)} title="Link"><LinkIcon size={18} /></button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false, false)} title="Image"><ImageIcon size={18} /></button>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <div style={{ flexGrow: 1 }} />

                    <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={toolbarButtonStyle(false, !editor.can().undo())} title="Undo"><Undo size={18} /></button>
                        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={toolbarButtonStyle(false, !editor.can().redo())} title="Redo"><Redo size={18} /></button>
                    </div>
                </div>

                <div style={{ position: 'relative', padding: '2rem' }}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror {
                    outline: none !important;
                    min-height: 250px;
                    font-family: 'Inter', -apple-system, sans-serif;
                    line-height: 1.6;
                    color: #334155;
                }
                .ProseMirror p { margin-bottom: 1.25rem; }
                .ProseMirror h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; color: #0f172a; }
                .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #1e293b; }
                .ProseMirror blockquote {
                    border-left: 4px solid #FF6B00;
                    background: #fffaf0;
                    margin: 1.5rem 0;
                    padding: 1rem 1.5rem;
                    border-radius: 0 12px 12px 0;
                    font-style: italic;
                }
                .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 16px;
                    display: block;
                    margin: 2rem auto;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .ProseMirror .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #cbd5e1;
                    pointer-events: none;
                    height: 0;
                }
                .editor-link { color: #FF6B00; text-decoration: underline; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
