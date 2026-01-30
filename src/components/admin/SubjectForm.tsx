'use client';

import React, { useState, useEffect } from 'react';

interface Subject {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
}

interface SubjectFormProps {
    editItem: Subject | null;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    onCancel: () => void;
    refreshSubjects: () => void;
}

const SubjectForm = ({ editItem, onSuccess, onError, onCancel, refreshSubjects }: SubjectFormProps) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [icon, setIcon] = useState('Book');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setName(editItem.name || '');
            setSlug(editItem.slug || '');
            setDescription(editItem.description || '');
            setIcon(typeof editItem.image === 'string' ? editItem.image : '');
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setIcon('Book');
            setImageFile(null);
        }
    }, [editItem]);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('slug', slug);
            formData.append('description', description);
            
            if (imageFile) {
                formData.append('image', imageFile);
            } else if (icon) {
                formData.append('image', icon);
            }

            const url = editItem 
                ? `${process.env.NEXT_PUBLIC_API_URL}/content/subjects/${editItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/content/subjects`;
            
            const method = editItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                onSuccess(`Subject ${editItem ? 'updated' : 'created'} successfully!`);
                if (!editItem) {
                    setName(''); setSlug(''); setDescription(''); setIcon('Book'); setImageFile(null);
                }
                refreshSubjects();
            } else {
                const data = await res.json();
                onError(data.message || 'Failed to save subject');
            }
        } catch (err) {
            onError('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{editItem ? 'Edit Subject' : 'Add New Subject'}</h2>
                {editItem && <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Cancel Edit</button>}
            </div>
            
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (!editItem) setSlug(slugify(e.target.value));
                    }}
                    required 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Slug (URL ID)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required 
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f9fa' }}
                    />
                    <button 
                        type="button" 
                        onClick={() => setSlug(slugify(name))}
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: '#f1f1f1' }}
                        title="Regenerate slug from name"
                    >
                        ↺
                    </button>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                    />
                    {!imageFile && (
                        <>
                            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>OR</div>
                            <input 
                                type="url" 
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="Enter Image URL (optional)"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </>
                    )}
                </div>
                <small style={{ color: '#888' }}>Upload an image or provide a direct link.</small>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Saving...' : (editItem ? 'Update Subject' : 'Create Subject')}
            </button>
        </form>
    );
};

export default SubjectForm;
