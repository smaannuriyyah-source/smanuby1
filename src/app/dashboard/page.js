'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchStats = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                const [dashRes, regRes] = await Promise.all([
                    fetch('/api/dashboard/stats', { headers }),
                    fetch('/api/registrations/stats', { headers })
                ]);

                const dashData = await dashRes.json();
                const regData = await regRes.json();

                setStats({
                    totalRegistrants: regData.count || 0,
                    totalArticles: dashData.totalArticles || 0,
                    totalUsers: dashData.totalUsers || 0,
                    visitors: dashData.visitors || 0
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    if (!user) return null;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827', marginBottom: '30px' }}>
                Dashboard Overview
            </h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
                    <p style={{ color: '#6B7280', marginTop: '10px' }}>Memuat data...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500', marginBottom: '10px' }}>Total Pendaftar</h3>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{stats?.totalRegistrants || 0}</p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500', marginBottom: '10px' }}>Artikel Terbit</h3>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{stats?.totalArticles || 0}</p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500', marginBottom: '10px' }}>Total Pengguna</h3>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{stats?.totalUsers || 0}</p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500', marginBottom: '10px' }}>Pengunjung Hari Ini</h3>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{stats?.visitors || 0}</p>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '40px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Akses Cepat</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <Link href="/dashboard/registrations" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        border: '1px solid #BFDBFE'
                    }}>
                        <ClipboardList size={20} /> Lihat Pendaftaran
                    </Link>
                    <Link href="/dashboard/articles" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF3C7',
                        color: '#D97706',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        border: '1px solid #FDE68A'
                    }}>
                        <FileText size={20} /> Kelola Artikel
                    </Link>
                </div>
            </div>

            <div style={{ marginTop: '30px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Selamat Datang di CMS Sekolah!</h3>
                <p style={{ color: '#4B5563', lineHeight: '1.6' }}>
                    Halo <strong>{user.name}</strong>, ini adalah panel admin untuk mengelola konten website sekolah.
                    Anda dapat menambahkan artikel, mengupdate data guru, dan memantau pendaftaran siswa baru dari sini.
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}