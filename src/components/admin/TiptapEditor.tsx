'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { motion } from 'framer-motion';
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
    Type
} from 'lucide-react';

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label: string;
}

const TiptapEditor = ({ value, onChange, placeholder, label }: TiptapEditorProps) => {
    const [uploading, setUploading] = useState(false);
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
                placeholder: placeholder || 'Start typing...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-orange-600 underline cursor-pointer hover:text-orange-700',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto my-6 mx-auto block shadow-lg transition-transform hover:scale-[1.01]',
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
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[250px] max-w-none p-6 text-gray-800 leading-relaxed',
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
        const url = window.prompt('Enter URL');
        if (url) {
            editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        } else {
            editor?.chain().focus().unsetLink().run();
        }
    }, [editor]);

    if (!editor) return null;

    const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                isActive 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
        >
            {children}
        </button>
    );

    const GroupDivider = () => <div className="w-px h-6 bg-gray-200 mx-1 self-center" />;

    return (
        <div className="mb-6 flex flex-col gap-3 group">
            <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700 tracking-tight flex items-center gap-2">
                    <Type size={16} className="text-orange-500" />
                    {label.toUpperCase()}
                </label>
                {uploading && (
                    <motion.span 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold animate-pulse"
                    >
                        UPLOADING IMAGE...
                    </motion.span>
                )}
            </div>

            <div className="border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-4 ring-transparent focus-within:ring-orange-50 focus-within:border-orange-200 transition-all">
                {/* Modern Toolbar */}
                <div className="bg-gray-50/50 backdrop-blur-sm p-2 border-b-2 border-gray-100 flex flex-wrap items-center gap-1.5">
                    {/* Text Styling */}
                    <div className="flex gap-1 items-center">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon size={18} /></ToolbarButton>
                    </div>
                    
                    <GroupDivider />
                    
                    {/* Headings */}
                    <div className="flex gap-1 items-center">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={18} /></ToolbarButton>
                    </div>
                    
                    <GroupDivider />
                    
                    {/* Lists & Quotes */}
                    <div className="flex gap-1 items-center">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote"><Quote size={18} /></ToolbarButton>
                    </div>
                    
                    <GroupDivider />
                    
                    {/* Alignment */}
                    <div className="flex gap-1 items-center">
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={18} /></ToolbarButton>
                    </div>
                    
                    <GroupDivider />
                    
                    {/* Media & Links */}
                    <div className="flex gap-1 items-center">
                        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Insert Link"><LinkIcon size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Upload Image"><ImageIcon size={18} /></ToolbarButton>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                    </div>
                    
                    <div className="flex-grow" />
                    
                    {/* History */}
                    <div className="flex gap-1 items-center">
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={18} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={18} /></ToolbarButton>
                    </div>
                </div>

                {/* Editor Area */}
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .ProseMirror {
                    outline: none !important;
                    min-height: 250px;
                }
                .ProseMirror .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                    font-style: italic;
                }
                .ProseMirror p { margin-bottom: 1.25em; }
                .ProseMirror h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: 0.5em; color: #111827; }
                .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5em; color: #1f2937; }
                .ProseMirror blockquote {
                    border-left: 4px solid #f97316;
                    padding-left: 1.25rem;
                    font-style: italic;
                    color: #4b5563;
                    background: #fffaf5;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-radius: 0 0.5rem 0.5rem 0;
                }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25em; }
                .ProseMirror li p { margin-bottom: 0.25em; }
            `}</style>
        </div>
    );
};

export default TiptapEditor;
