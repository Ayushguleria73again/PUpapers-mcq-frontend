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
                html: false,
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
                    class: 'text-[#FF6B00] underline decoration-2 underline-offset-4 cursor-pointer hover:text-[#e66000] transition-colors',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl max-w-full h-auto my-8 mx-auto block shadow-2xl transition-all hover:scale-[1.02] ring-1 ring-gray-200',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onChange(markdown);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[300px] max-w-none px-8 py-10 text-gray-800 leading-relaxed font-outfit',
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
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
                return false;
            },
        },
    });

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

    const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title }: any) => (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border-2 ${
                isActive 
                ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF8E3C] text-white border-transparent shadow-lg shadow-[#FF6B00]/20' 
                : 'bg-white text-gray-500 border-transparent hover:border-gray-100 hover:text-[#FF6B00] hover:bg-gray-50'
            } ${disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </motion.button>
    );

    const GroupDivider = () => <div className="w-[1.5px] h-8 bg-gray-100 mx-1 self-center" />;

    return (
        <div className="mb-8 flex flex-col gap-4">
            <div className="flex justify-between items-end px-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-black text-gray-400 tracking-widest flex items-center gap-2">
                        <Wand2 size={12} className="text-[#FF6B00]" />
                        {label.toUpperCase()} CONTENT
                    </label>
                    <h3 className="text-xl font-bold text-gray-800">Visual Editor</h3>
                </div>
                <AnimatePresence>
                    {uploading && (
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00] px-3 py-1.5 rounded-full font-bold flex items-center gap-2"
                        >
                            <Sparkles size={12} className="animate-pulse" />
                            OPTIMIZING IMAGE...
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className={`
                border-2 rounded-[24px] overflow-hidden bg-white transition-all duration-300
                ${isFocused 
                    ? 'border-[#FF6B00]/40 ring-[12px] ring-[#FF6B00]/5 shadow-2xl scale-[1.005]' 
                    : 'border-gray-100 shadow-xl shadow-gray-200/50'
                }
            `}>
                {/* Minimal Premium Toolbar */}
                <div className="bg-[#fcfcfe]/80 backdrop-blur-md p-3 border-b-2 border-gray-50 flex flex-wrap items-center gap-2">
                    {/* Groups */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-50 shadow-sm">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon size={18} /></ToolbarButton>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-50 shadow-sm">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={18} /></ToolbarButton>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-50 shadow-sm">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="List"><List size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote"><Quote size={18} /></ToolbarButton>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-50 shadow-sm">
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={18} /></ToolbarButton>
                        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Link"><LinkIcon size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Magic Image"><ImageIcon size={18} /></ToolbarButton>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <div className="flex-grow" />

                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-50 shadow-sm pr-2">
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={18} /></ToolbarButton>
                    </div>
                </div>

                {/* Editor Surface */}
                <div className="relative">
                    <EditorContent editor={editor} />
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror {
                    outline: none !important;
                }
                .ProseMirror .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #d1d5db;
                    pointer-events: none;
                    height: 0;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                }
                .ProseMirror p { margin-bottom: 1.5em; font-size: 1.1rem; color: #374151; }
                .ProseMirror h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.75em; color: #111827; letter-spacing: -0.02em; line-height: 1.2; }
                .ProseMirror h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.6em; color: #1f2937; letter-spacing: -0.015em; }
                .ProseMirror blockquote {
                    border-left: 6px solid #FF6B00;
                    padding: 1.5rem 2rem;
                    font-style: italic;
                    color: #4b5563;
                    background: linear-gradient(to right, #fffaf5, transparent);
                    border-radius: 4px 16px 16px 4px;
                    margin: 2rem 0;
                    font-size: 1.25rem;
                }
                .ProseMirror ul { list-style-type: none; padding-left: 1.5rem; margin-bottom: 1.5em; }
                .ProseMirror ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5em; }
                .ProseMirror ul li::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.6em;
                    width: 8px;
                    height: 8px;
                    background: #FF6B00;
                    border-radius: 50%;
                }
                .ProseMirror ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 1.5em; }
                .ProseMirror ol li { padding-left: 0.5rem; margin-bottom: 0.5em; font-weight: 500; }
                .ProseMirror li p { margin-bottom: 0.25em; font-weight: 400; }
                
                /* Selection style */
                .ProseMirror *::selection {
                    background: rgba(255, 107, 0, 0.15);
                    color: inherit;
                }

                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
