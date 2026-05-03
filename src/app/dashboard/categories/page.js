'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';

export default function CategoriesPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.categories) setCategories(data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
            const method = editingCategory ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            await response.json();
            fetchCategories();
            closeModal();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Gagal menyimpan kategori');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Gagal menghapus kategori');
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>Kategori</h2>
                <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                    <Plus size={20} /> Tambah Kategori
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {categories.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6B7280', padding: '40px' }}>Belum ada kategori</p>
                    ) : (
                        categories.map(category => (
                            <div key={category.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{category.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '16px' }}>{category.description || 'Tidak ada deskripsi'}</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openModal(category)} style={{ flex: 1, padding: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(category.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        <Trash2 size={16} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827' }}>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <button onClick={closeModal} style={{ padding: '4px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Nama Kategori</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Deskripsi</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>Batal</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#16A34A', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}