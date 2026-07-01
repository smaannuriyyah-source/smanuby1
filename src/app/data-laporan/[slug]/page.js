'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { FileText, Download, Loader2, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function DataLaporanDetailPage() {
    const params = useParams();
    const slug = params.slug;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/public/data-laporan/${slug}`);
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                } else if (data.data_laporan) {
                    setItem(data.data_laporan);
                }
            } catch (err) {
                console.error('Failed to fetch data laporan:', err);
                setError('Gagal memuat data laporan');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const isImage = (url) => {
        if (!url) return false;
        return url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    };

    const isPdf = (url) => {
        if (!url) return false;
        return url.match(/\.(pdf)$/i);
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <Navbar />
                <div className="container" style={{ marginTop: '120px', textAlign: 'center', padding: '60px 0' }}>
                    <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '16px' }}>Data Laporan Tidak Ditemukan</h1>
                    <p style={{ color: '#6B7280', marginBottom: '24px' }}>{error || 'Data laporan yang Anda cari tidak tersedia'}</p>
                    <Link href="/data-laporan" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#16A34A',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>
                        <ArrowLeft size={18} /> Kembali ke Data Laporan
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '100px', marginBottom: '60px' }}>
                <Link href="/data-laporan" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6B7280',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    marginBottom: '24px'
                }}>
                    <ArrowLeft size={16} /> Kembali ke Data Laporan
                </Link>

                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: '32px 40px', borderBottom: '1px solid #E5E7EB' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                            {item.name}
                        </h1>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', color: '#6B7280', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} /> {formatDate(item.created_at)}
                            </span>
                            {item.author_name && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={16} /> {item.author_name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '40px' }}>
                        {item.description && (
                            <p style={{ color: '#374151', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '32px' }}>
                                {item.description}
                            </p>
                        )}

                        {item.file_url && isImage(item.file_url) && (
                            <div style={{ marginBottom: '32px' }}>
                                <img
                                    src={item.file_url}
                                    alt={item.name}
                                    style={{
                                        width: '100%',
                                        maxHeight: '700px',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                        display: 'block'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                        )}

                        {item.file_url && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '16px',
                                padding: '24px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: isPdf(item.file_url) ? '#FEF3C7' : '#EFF6FF',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FileText size={24} style={{ color: isPdf(item.file_url) ? '#D97706' : '#2563EB' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                            {isImage(item.file_url) ? 'Gambar' : isPdf(item.file_url) ? 'Dokumen PDF' : 'File Lampiran'}
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                            Klik untuk mengunduh atau membuka file
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={item.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        backgroundColor: '#2563EB',
                                        color: '#ffffff',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Download size={18} />
                                    {isImage(item.file_url) ? 'Lihat Gambar Penuh' : isPdf(item.file_url) ? 'Download PDF' : 'Download File'}
                                </a>
                            </div>
                        )}

                        {!item.file_url && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                                <FileText size={48} style={{ marginBottom: '12px' }} />
                                <p>Tidak ada file lampiran</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <Footer />
        </div>
    );
}
