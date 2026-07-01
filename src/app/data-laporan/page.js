'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FileText, Download, Loader2, Search } from 'lucide-react';

export default function DataLaporanPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/public/data-laporan');
                const data = await response.json();
                if (data.data_laporan) {
                    setItems(data.data_laporan);
                }
            } catch (error) {
                console.error('Failed to fetch data laporan:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getFileIcon = (url) => {
        if (!url) return <FileText size={20} />;
        if (url.match(/\.(pdf)$/i)) return <FileText size={20} color="#DC2626" />;
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <FileText size={20} color="#16A34A" />;
        return <FileText size={20} color="#2563EB" />;
    };

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '120px', flex: 1, marginBottom: '60px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>Data Laporan</h1>
                    <p style={{ color: '#6B7280', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Akses dokumen dan laporan resmi sekolah.
                    </p>
                </div>

                <div style={{ maxWidth: '500px', margin: '0 auto 40px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Cari laporan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 45px',
                            borderRadius: '99px',
                            border: '1px solid #E5E7EB',
                            fontSize: '1rem',
                            outline: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A', margin: '0 auto' }} />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
                        <p style={{ fontSize: '1.1rem' }}>Tidak ada laporan ditemukan.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F3F4F6' }}>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>No</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Laporan</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Upload</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                    >
                                        <td style={{ padding: '16px 20px', color: '#6B7280', fontSize: '0.95rem' }}>{idx + 1}</td>
                                        <td style={{ padding: '16px 20px', color: '#111827', fontSize: '0.95rem', fontWeight: '500' }}>{item.name}</td>
                                        <td style={{ padding: '16px 20px', color: '#6B7280', fontSize: '0.9rem' }}>{formatDate(item.created_at)}</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            {item.file_url ? (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '8px 16px',
                                                        backgroundColor: '#EFF6FF',
                                                        color: '#2563EB',
                                                        borderRadius: '8px',
                                                        textDecoration: 'none',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.color = '#2563EB'; }}
                                                >
                                                    <Download size={16} /> Lihat File
                                                </a>
                                            ) : (
                                                <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <Footer />
        </div>
    );
}
