'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Eye, FileText, Download } from 'lucide-react';

export default function DataLaporanDashboardPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', file: null });
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/data-laporan', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.data_laporan) setItems(data.data_laporan);
        } catch (error) {
            console.error('Failed to fetch data laporan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            if (formData.file) formDataToSend.append('file', formData.file);

            const token = localStorage.getItem('token');
            const url = editingItem ? `/api/data-laporan/${editingItem.id}` : '/api/data-laporan';
            const method = editingItem ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataToSend
            });

            const result = await response.json();

            if (!response.ok) {
                setUploadError(result.error || 'Gagal menyimpan data');
                return;
            }

            fetchItems();
            closeModal();
        } catch (error) {
            console.error('Failed to save data laporan:', error);
            setUploadError('Terjadi kesalahan jaringan');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus data laporan ini?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/data-laporan/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchItems();
        } catch (error) {
            console.error('Failed to delete data laporan:', error);
            alert('Gagal menghapus data laporan');
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, description: item.description || '', file: null });
        } else {
            setEditingItem(null);
            setFormData({ name: '', description: '', file: null });
        }
        setUploadError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setViewingItem(null);
        setFormData({ name: '', description: '', file: null });
        setUploadError('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const isImage = (url) => {
        if (!url) return false;
        return url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    };

    const isPdf = (url) => {
        if (!url) return false;
        return url.match(/\.(pdf)$/i);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>Data Laporan</h2>
                <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                    <Plus size={20} /> Tambah Data Laporan
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
                </div>
            ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>No</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Nama Laporan</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Slug</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>File Upload</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Penulis</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Tanggal</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Belum ada data laporan</td></tr>
                            ) : (
                                items.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#6B7280' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>{item.name}</td>
                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: '#6B7280', fontFamily: 'monospace' }}>{item.slug || '-'}</td>
                                        <td style={{ padding: '12px' }}>
                                            {item.file_url ? (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 12px',
                                                        backgroundColor: '#EFF6FF',
                                                        color: '#2563EB',
                                                        borderRadius: '6px',
                                                        textDecoration: 'none',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <Download size={14} /> Lihat File
                                                </a>
                                            ) : (
                                                <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#6B7280' }}>{item.author_name}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#6B7280' }}>{formatDate(item.created_at)}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => setViewingItem(item)} style={{ padding: '6px', backgroundColor: '#F0FDF4', color: '#16A34A', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={16} /></button>
                                                <button onClick={() => openModal(item)} style={{ padding: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} style={{ padding: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form Tambah/Edit */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827' }}>{editingItem ? 'Edit Data Laporan' : 'Tambah Data Laporan'}</h3>
                            <button onClick={closeModal} style={{ padding: '4px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            {uploadError && (
                                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    {uploadError}
                                </div>
                            )}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Nama Laporan</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>
                                    File Upload {editingItem && '(Kosongkan jika tidak ingin mengubah)'}
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', boxSizing: 'border-box' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '6px' }}>Maksimal ukuran file: 2MB. Format: PDF, JPG, PNG, GIF, WEBP.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>Batal</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#16A34A', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal View Detail */}
            {viewingItem && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827' }}>Detail Data Laporan</h3>
                            <button onClick={closeModal} style={{ padding: '4px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Nama Laporan</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>{viewingItem.name}</p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Penulis</p>
                                <p style={{ fontSize: '1rem', color: '#111827' }}>{viewingItem.author_name}</p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Tanggal</p>
                                <p style={{ fontSize: '1rem', color: '#111827' }}>{formatDate(viewingItem.created_at)}</p>
                            </div>
                            {viewingItem.file_url && (
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '8px' }}>File</p>
                                    {isImage(viewingItem.file_url) ? (
                                        <div>
                                            <img
                                                src={viewingItem.file_url}
                                                alt={viewingItem.name}
                                                style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'contain' }}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.onerror = null; }}
                                            />
                                            <a
                                                href={viewingItem.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    marginTop: '12px',
                                                    padding: '8px 16px',
                                                    backgroundColor: '#EFF6FF',
                                                    color: '#2563EB',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <Download size={16} /> Buka File di Tab Baru
                                            </a>
                                        </div>
                                    ) : (
                                        <a
                                            href={viewingItem.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '12px 20px',
                                                backgroundColor: '#EFF6FF',
                                                color: '#2563EB',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontSize: '0.95rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <FileText size={20} />
                                            {isPdf(viewingItem.file_url) ? 'Lihat PDF' : 'Download File'}
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
