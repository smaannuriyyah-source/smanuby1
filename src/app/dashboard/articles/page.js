'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/articles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.articles) setArticles(data.articles);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus artikel ini?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchArticles();
        } catch (error) {
            console.error('Failed to delete article:', error);
            alert('Gagal menghapus artikel');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            draft: '#6B7280',
            published: '#16A34A',
            archived: '#DC2626'
        };
        return { backgroundColor: colors[status] || '#6B7280', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' };
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827' }}>Artikel</h2>
                <Link href="/dashboard/articles/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
                    <Plus size={20} /> Tambah Artikel
                </Link>
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
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Judul</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Kategori</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Penulis</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Belum ada artikel</td>
                                </tr>
                            ) : (
                                articles.map(article => (
                                    <tr key={article.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#111827' }}>{article.title}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#6B7280' }}>{article.category_name || '-'}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#6B7280' }}>{article.author_name}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={getStatusBadge(article.status)}>{article.status}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => router.push(`/dashboard/articles/edit/${article.id}`)} style={{ padding: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(article.id)} style={{ padding: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}