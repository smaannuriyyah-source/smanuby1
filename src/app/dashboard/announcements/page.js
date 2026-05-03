'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Megaphone, FileText, Clock, Eye } from 'lucide-react';

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/announcements', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.announcements) setAnnouncements(data.announcements);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            alert('Gagal menghapus pengumuman');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('status', newStatus);
            const response = await fetch(`/api/announcements/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatCountdown = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>Pengumuman</h2>
                <Link href="/dashboard/announcements/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>
                    <Plus size={20} /> Tambah Pengumuman
                </Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
                </div>
            ) : announcements.length === 0 ? (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <Megaphone size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#374151', marginBottom: '8px' }}>Belum ada pengumuman</h3>
                    <p style={{ color: '#6B7280', marginBottom: '20px' }}>Buat pengumuman pertama Anda</p>
                    <Link href="/dashboard/announcements/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
                        <Plus size={18} /> Tambah Pengumuman
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {announcements.map(ann => (
                        <div key={ann.id} style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{ann.title}</h3>
                                        <span style={{ backgroundColor: ann.status === 'published' ? '#DCFCE7' : '#F3F4F6', color: ann.status === 'published' ? '#16A34A' : '#6B7280', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                                            {ann.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#6B7280' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> {formatDate(ann.created_at)}</span>
                                        {ann.pdf_url && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB' }}>&#128206; PDF</span>}
                                        {ann.csv_data && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>&#128202; Tabel CSV</span>}
                                        {ann.countdown_date && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7C3D0E' }}>
                                                <Clock size={14} /> Countdown: {formatCountdown(ann.countdown_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => toggleStatus(ann.id, ann.status)}
                                        style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', backgroundColor: ann.status === 'published' ? '#FEF3C7' : '#DCFCE7', color: ann.status === 'published' ? '#D97706' : '#16A34A' }}
                                    >
                                        <Eye size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                        {ann.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <Link href={`/dashboard/announcements/edit/${ann.id}`} style={{ padding: '8px 14px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Edit size={14} /> Edit
                                    </Link>
                                    <button onClick={() => handleDelete(ann.id)} style={{ padding: '8px 14px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}